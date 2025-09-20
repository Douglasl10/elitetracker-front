
import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/login';
import Habits from '../pages/habits';
import Autenticacao from '../pages/auth';
import { PrivateRoutes } from './private-routes';
import { Focus } from '../pages/focus';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Login/>
    },
    {
        path: '/habits',
        element: <PrivateRoutes component={<Habits />} />
    },
    {
        path: '/autenticacao',
        element: <Autenticacao />
    },
    {
        path: '/focus',
        element: <PrivateRoutes component={<Focus />} />
    },
]);
