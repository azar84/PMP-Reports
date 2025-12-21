import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET - List all users
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true, // Legacy field, kept for backward compatibility
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map users to include primary role from RBAC system (first role, or fallback to legacy role field)
    const usersWithRoles = users.map(user => ({
      ...user,
      roles: user.userRoles.map(ur => ur.role),
      primaryRole: user.userRoles.length > 0 
        ? user.userRoles[0].role.name 
        : user.role // Fallback to legacy role field if no RBAC roles assigned
    }));

    return NextResponse.json(usersWithRoles);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const { username, email, password, name, role, hasAllProjectsAccess } = await request.json();

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this username or email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Get tenant ID (default to 1 as per schema)
    // In a multi-tenant system, this should come from context/authentication
    const tenantId = 1;

    // Create user and assign role
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.adminUser.create({
        data: {
          username,
          email,
          passwordHash,
          name: name || null,
          role: role || 'admin',
          isActive: true,
          tenantId: tenantId,
          hasAllProjectsAccess: hasAllProjectsAccess === true,
        },
      });

      // If role is provided, create UserRole relationship
      if (role) {
        const roleRecord = await tx.role.findFirst({
          where: {
            name: role,
            tenantId: tenantId,
          },
        });

        if (roleRecord) {
          await tx.userRole.create({
            data: {
              userId: createdUser.id,
              roleId: roleRecord.id,
            },
          });
        }
      }

      return createdUser;
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      hasAllProjectsAccess: user.hasAllProjectsAccess,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 