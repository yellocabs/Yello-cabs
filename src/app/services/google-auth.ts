// src/services/google-auth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';



export const configureGoogleSignIn = () => {
    GoogleSignin.configure({
        webClientId:
            '698878689210-mhh65t6tlrjk4buum91ehqtjor1l32qe.apps.googleusercontent.com',
        iosClientId:
            '698878689210-u68aueo9e4s6fp1av4fn2i5k061b5rqe.apps.googleusercontent.com',
        // androidClientId:
        //     "698878689210-44au1a4d7i0vm3ua2ec4qv3o21niqn7b.apps.googleusercontent.com", "project_id": "yellocabs", "auth_uri": "https://accounts.google.com/o/oauth2/auth", "token_uri": "https://oauth2.googleapis.com/token", "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        scopes: ['profile', 'email'],
    });
};

export const googleLogin = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        return { ok: true, data: userInfo };
    } catch (error: any) {
        console.log('Google sign in error:', error);
        return { ok: false, error };
    }
};

