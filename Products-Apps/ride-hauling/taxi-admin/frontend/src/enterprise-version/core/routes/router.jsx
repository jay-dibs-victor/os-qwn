/* eslint-disable import/no-named-as-default */

import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import AdminRoutes from './Admin/AdminRoutes';
const AppRoutes = () => {
  return (
    <>
      <AdminRoutes />
    </>
  );
};

export default AppRoutes;
