const ISSUES =
  'https://github.com/TheBigBadWolf228/toolshop-testing-framework/issues';

export const ADMIN_DASHBOARD_RENDER_ERROR = {
  tag: '@flaky',
  annotation: [
    { type: 'issue', description: `${ISSUES}/26` },
    {
      type: 'description',
      description:
        'Admin dashboard throws "null.toFixed" while rendering and sometimes shows no content',
    },
  ],
};

export const PROFILE_FORM_NOT_FILLED = {
  tag: '@flaky',
  annotation: [
    { type: 'issue', description: `${ISSUES}/27` },
    {
      type: 'description',
      description:
        'Profile form sometimes stays empty although GET /users/me returned the user (Chrome, parallel runs)',
    },
  ],
};
