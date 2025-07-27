import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import Gallery from "./pages/Gallery";
import NFT from "./pages/NFT";
import Header from "./components/Header";
import Footer from "./components/Footer";

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route index element={<Gallery />} />
      <Route path="nft/:id" element={<NFT />} />
    </Route>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
