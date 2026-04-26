import { Routes, Route } from 'react-router'
import Layout from '@/components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Charts from './pages/Charts'
import ReadingPage from './pages/ReadingPage'
import ReadingDetail from './pages/ReadingDetail'
import History from './pages/History'
import Pricing from './pages/Pricing'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/reading/:id" element={<ReadingDetail />} />
        <Route path="/history" element={<History />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
