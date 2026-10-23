export const ADMIN_DASHBOARD_RENDER_ERROR = {
  tag: '@flaky',
  annotation: {
    type: 'issue',
    description:
      'Admin dashboard throws "null.toFixed" while rendering and sometimes shows no content',
  },
};

export const PROFILE_FORM_NOT_FILLED = {
  tag: '@flaky',
  annotation: {
    type: 'issue',
    description:
      'Profile form sometimes stays empty although GET /users/me returned the user (Chrome, parallel runs)',
  },
};
