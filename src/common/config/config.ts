export const Config = {
    jwt : {
        accessToken: {
            expiresIn: '3d',
            expiresInMs: 3*24*60*60*1000,
        },

        refreshToken: {
            expiresIn: '30d',
            expiresInMs: 30*24*60*60*1000,
        }
    },

    cookie : {
        names : {
            accessToken : 'access_token',
            refreshToken : 'refresh_token',
        },
        options : {
            httpOnly : true,
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path : '/',
        },
    }
}as const;