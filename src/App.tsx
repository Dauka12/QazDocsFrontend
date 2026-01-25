import { 
  Outlet, 
  RouterProvider, 
  createRootRoute, 
  createRoute, 
  createRouter 
} from '@tanstack/react-router'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './pages/DashboardLayout'
import OrganizationsPage from './pages/OrganizationsPage'
import DocumentsPage from './pages/DocumentsPage'
import ProductsPage from './pages/ProductsPage'
import SolutionsPage from './pages/SolutionsPage'
import PricingPage from './pages/PricingPage'
import AboutPage from './pages/AboutPage'
import EmployeesPage from './pages/EmployeesPage'
import ProfilesPage from './pages/ProfilesPage'
import CounterpartiesPage from './pages/CounterpartiesPage'
import AssignmentsPage from './pages/AssignmentsPage'
import Navbar from './components/Navbar'

// Root Route
const rootRoute = createRootRoute({
  component: Outlet,
})

// Marketing Layout (with Navbar)
const marketingLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: 'marketing',
  component: () => (
    <>
      <Navbar />
      <Outlet />
    </>
  ),
})

// Index Route (Landing)
const indexRoute = createRoute({
  getParentRoute: () => marketingLayout,
  path: '/',
  component: LandingPage,
})

// Products Route
const productsRoute = createRoute({
  getParentRoute: () => marketingLayout,
  path: '/products',
  component: ProductsPage,
})

// Solutions Route
const solutionsRoute = createRoute({
  getParentRoute: () => marketingLayout,
  path: '/solutions',
  component: SolutionsPage,
})

// Pricing Route
const pricingRoute = createRoute({
  getParentRoute: () => marketingLayout,
  path: '/pricing',
  component: PricingPage,
})

// About Route
const aboutRoute = createRoute({
  getParentRoute: () => marketingLayout,
  path: '/about',
  component: AboutPage,
})

// Login Route
const loginRoute = createRoute({
  getParentRoute: () => marketingLayout,
  path: '/login',
  component: LoginPage,
})

// Register Route
const registerRoute = createRoute({
  getParentRoute: () => marketingLayout,
  path: '/register',
  component: RegisterPage,
})

// Dashboard Layout Route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardLayout,
})

// Dashboard Index (redirects to organizations)
const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: OrganizationsPage,
})

const organizationsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'organizations',
  component: OrganizationsPage,
})

const documentsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'documents',
  component: DocumentsPage,
})

const employeesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'employees',
  component: EmployeesPage,
})

const profilesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'profiles',
  component: ProfilesPage,
})

const counterpartiesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'counterparties',
  component: CounterpartiesPage,
})

const assignmentsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'assignments',
  component: AssignmentsPage,
})

// Router instance
const routeTree = rootRoute.addChildren([
  marketingLayout.addChildren([
    indexRoute, 
    productsRoute, 
    solutionsRoute, 
    pricingRoute, 
    aboutRoute, 
    loginRoute,
    registerRoute,
  ]),
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    organizationsRoute,
    documentsRoute,
    profilesRoute,
    counterpartiesRoute,
    assignmentsRoute
  ])
])
const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return <RouterProvider router={router} />
}

export default App
