-- First, create the user account if it doesn't exist
DO $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Check if user already exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mdtrans@mail.com') THEN
        -- Insert into auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'mdtrans@mail.com',
            crypt('mdtrans1', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO new_user_id;

        -- Create profile if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = new_user_id) THEN
            INSERT INTO profiles (
                id,
                email,
                full_name,
                avatar_url
            )
            VALUES (
                new_user_id,
                'mdtrans@mail.com',
                'MD Trans',
                ''
            );
        END IF;

        -- Create bus company if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM bus_companies WHERE user_id = new_user_id) THEN
            INSERT INTO bus_companies (
                id,
                user_id,
                company_name,
                description,
                phone,
                email,
                status,
                created_at
            )
            VALUES (
                gen_random_uuid(),
                new_user_id,
                'MD Trans',
                'Test bus company for Moldova transportation services',
                '+373 22 123456',
                'mdtrans@mail.com',
                'active',
                NOW()
            );
        END IF;
    ELSE
        -- Get the existing user ID
        SELECT id INTO new_user_id FROM auth.users WHERE email = 'mdtrans@mail.com';
        
        -- Create profile if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = new_user_id) THEN
            INSERT INTO profiles (
                id,
                email,
                full_name,
                avatar_url
            )
            VALUES (
                new_user_id,
                'mdtrans@mail.com',
                'MD Trans',
                ''
            );
        END IF;

        -- Create bus company if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM bus_companies WHERE user_id = new_user_id) THEN
            INSERT INTO bus_companies (
                id,
                user_id,
                company_name,
                description,
                phone,
                email,
                status,
                created_at
            )
            VALUES (
                gen_random_uuid(),
                new_user_id,
                'MD Trans',
                'Test bus company for Moldova transportation services',
                '+373 22 123456',
                'mdtrans@mail.com',
                'active',
                NOW()
            );
        END IF;
    END IF;
END $$; 