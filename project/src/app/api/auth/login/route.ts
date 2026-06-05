import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/types'
import usersData from '../../../../../data/users/user.json'

export async function POST(req: NextRequest) {
    const { email, password } = await req.json()

    // basic input validation.
    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })  
    }

    // email format validation. input sanity check.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    //finding the user in the users.json file

    // checking email case-insensitively and password case-sensitively.
    const user = (usersData.users as unknown as User[]).find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    
    // if user is not found, return 401 Unauthorized with a generic error message.
    if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // now at this point, we have a valid user. We will return the user data except the password.
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
}

