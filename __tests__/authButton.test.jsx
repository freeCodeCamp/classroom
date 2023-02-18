import { screen, render } from "@testing-library/react";
import AuthButton from "../components/authButton";
import "@testing-library/jest-dom";
import { useSession } from "next-auth/react";

jest.mock('next-auth/react', () => {
    const originalModule = jest.requireActual('next-auth/react');
    return {
        __esModule: true,
        ...originalModule,
        useSession: jest.fn() 
    };
});

describe("Auth Button", () => {
    it('shows Sign out when session exists', async () => {
        useSession.mockImplementation(() => {
            return {data: {user: 'test@google.com'}, status: 'authenticated'}
        })
        const {container} = render(<AuthButton></AuthButton>)
        expect(screen.getByText("Sign out")).toBeInTheDocument();
    }),
    it('shows Sign in when a session does not exist', () => {
        useSession.mockImplementation(() => {
            return {data: null, status: 'unauthenticated'}
        }) 
        const {container} = render(<AuthButton></AuthButton>)
        expect(screen.getByText("Sign in")).toBeInTheDocument();
    })
})