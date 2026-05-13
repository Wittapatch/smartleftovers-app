import {useEffect, useState} from "react";
import {View, Text} from "react-native";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../config/firebaseConfig";

export default function AuthChecker() {
    // store the current Firebase user.
    // It starts as null because we don't know yet if someone is logged in.
    const[user, setUser] = useState<User|null>(null);
    
    useEffect(() => {
        // Listten for login/logout changes from Firebase
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // If logged in, currentUser contains user info.
            // If logged out, currentUser is null.
            setUser(currentUser);
        });
        // Stop listening when this component is removed
        return unsubscribe;
    }, []);
    return (
        <View> 
            {user ? (
                <Text> Logged in as {user.email} </Text>
            ) : (
                <Text> No user logged in </Text>
            )}
        </View>

    );
}