import { parseStringify } from "../utils";

export const signUp = async ({userData})=>{
    return parseStringify(userData);
}

export async function getLoggedInUser(){
    const user = {name:"aaaksh",email:"jj@gmail.com"}
    
    return user
}
import jwt from 'jsonwebtoken';




const getUserInfo = async () => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const decodedToken = jwt.decode(token);
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

export default getUserInfo;


