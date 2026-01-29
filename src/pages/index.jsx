export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/projects',
      permanent: false
    }
  };
}

export default function Home() {
  return null;
}
