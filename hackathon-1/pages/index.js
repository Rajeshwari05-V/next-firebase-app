import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home({ data }) {
  return (
    <div>
      <h1>Firestore Data:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export async function getServerSideProps() {
  const querySnapshot = await getDocs(collection(db, "your-collection-name"));
  const data = querySnapshot.docs.map(doc => doc.data());

  return {
    props: { data }
  };
}
