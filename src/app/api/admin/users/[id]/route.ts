import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET - Get specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const user = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true, // Legacy field
        isActive: true,
        hasAllProjectsAccess: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                isSystem: true,
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Include primary role from RBAC system
    const userWithRole = {
      ...user,
      roles: user.userRoles.map(ur => ur.role),
      primaryRole: user.userRoles.length > 0 
        ? user.userRoles[0].role.name 
        : user.role // Fallback to legacy role field
    };

    return NextResponse.json(userWithRole);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { username, email, name, role, isActive, password, hasAllProjectsAccess } = await request.json();

    // Check if user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if username/email is already taken by another user
    if (username || email) {
      const duplicateUser = await prisma.adminUser.findFirst({
        where: {
          OR: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : [])
          ],
          NOT: { id: userId }
        }
      });

      if (duplicateUser) {
        return NextResponse.json(
          { error: 'Username or email already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (hasAllProjectsAccess !== undefined) updateData.hasAllProjectsAccess = hasAllProjectsAccess;
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    // Update user and handle role assignment to UserRole table
    const user = await prisma.$transaction(async (tx) => {
      // Update user basic info
      const updatedUser = await tx.adminUser.update({
      where: { id: userId },
      data: updateData,
      });

      // If role is being updated, update the UserRole relationship
      if (role !== undefined) {
        // Find the role by name
        const roleRecord = await tx.role.findFirst({
          where: {
            name: role,
            tenantId: existingUser.tenantId,
          },
        });

        if (roleRecord) {
          // Delete existing user roles for this user
          await tx.userRole.deleteMany({
            where: { userId: userId },
          });

          // Create new UserRole relationship
          await tx.userRole.create({
            data: {
              userId: userId,
              roleId: roleRecord.id,
            },
          });
        }
      }

      // If hasAllProjectsAccess is being set to true, remove all individual project memberships
      if (hasAllProjectsAccess === true) {
        await tx.projectMembership.deleteMany({
          where: { userId: userId },
        });
      }

      return updatedUser;
    });

    // Fetch user with roles to return complete data
    const userWithRoles = await prisma.adminUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        hasAllProjectsAccess: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                isSystem: true,
              }
            }
          }
        }
      }
    });

    if (!userWithRoles) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: userWithRoles.id,
      username: userWithRoles.username,
      email: userWithRoles.email,
      name: userWithRoles.name,
      role: userWithRoles.role,
      isActive: userWithRoles.isActive,
      hasAllProjectsAccess: userWithRoles.hasAllProjectsAccess,
      lastLoginAt: userWithRoles.lastLoginAt,
      createdAt: userWithRoles.createdAt,
      updatedAt: userWithRoles.updatedAt,
      roles: userWithRoles.userRoles.map(ur => ur.role),
      primaryRole: userWithRoles.userRoles.length > 0 
        ? userWithRoles.userRoles[0].role.name 
        : userWithRoles.role
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.adminUser.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't allow deleting the last admin user
    const adminUsers = await prisma.adminUser.count({
      where: { role: 'admin', isActive: true }
    });

    if (existingUser.role === 'admin' && adminUsers <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin user' },
        { status: 400 }
      );
    }

    await prisma.adminUser.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 