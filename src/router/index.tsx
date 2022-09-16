import { lazy, Suspense } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

const Home = lazy(() => import('./routes/Home'));
const PageNotFound = lazy(() => import('./routes/404'));

export default function RootRoute() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
