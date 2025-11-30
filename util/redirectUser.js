export default function redirectUser(destination) {
  return {
    redirect: {
      destination,
      permanent: false
    }
  };
}
