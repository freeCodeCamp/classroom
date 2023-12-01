import redirectUser from '../../util/redirectUser.js';
//import { createMemoryHistory } from "history";

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
    
    /*
    it('should do redirect to /some/route', async () => {
        // given
        const history = createMemoryHistory();
      
        // when
        render(<Router history={history}><MyComponent /></Router>);
      
        // do stuff which leads to redirection
        redirectUser('/error');
      
        // then
        await waitFor(() => {
          expect(history.location.pathname).toBe('/error');
        });
      });
      */
});

