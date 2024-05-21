"use client"
// withAuth.js (Higher-order component for authentication)

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import * as jwtDecode from 'jwt-decode';

const getUserInfo = async (token) => {
    if (!token) return null;

    try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user_id;
        const response = await fetch(`http://127.0.0.1:5000/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            return userData;
        } else {
            console.error('Failed to fetch user details');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details', error);
        return null;
    }
};

const withAuth = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();

        useEffect(() => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/sign-in');
                return;
            }

            const fetchUserData = async () => {
                const userInfo = await getUserInfo(token);
                if (!userInfo) {
                    router.push('/sign-in');
                }
            };

            fetchUserData();
        }, []);

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
