/* eslint-disable import/no-named-as-default */

import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import UserRoutes from './User/UserRoutes';

const AppRoutes = () => {
  return (
    <>
      <UserRoutes />
    </>
  );
};

export default AppRoutes;
