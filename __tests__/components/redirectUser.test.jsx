import redirectUser from '../../util/redirectUser.js';

describe('redirectUser', () => {
    
    it('should return a redirect object with the given destination', () => {
        const result = redirectUser("/error");
        expect(result).toEqual({
            redirect: {
                destination: "/error",
                permanent: false,
            },
        });

        result = redirectUser("/classes");
        expect(result).toEqual({
            redirect: {
                destination: "/classes",
                permanent: false,
            },
        });

        result = redirectUser("/admin");
        expect(result).toEqual({
            redirect: {
                destination: "/admin",
                permanent: false,
            },
        });
    });
    
});

