import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Agenda from './pages/Agenda.jsx'
import Pacientes from './pages/Pacientes.jsx'
import Resumen from './pages/Resumen.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Agenda />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/resumen" element={<Resumen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
