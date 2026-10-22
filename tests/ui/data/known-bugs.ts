export const ADMIN_DASHBOARD_RENDER_ERROR = {
  annotation: {
    type: 'issue',
    description:
      'Admin dashboard throws "null.toFixed" while rendering and sometimes shows no content',
  },
};

export const PROFILE_FORM_NOT_FILLED = {
  annotation: {
    type: 'issue',
    description:
      'Profile form sometimes stays empty although GET /users/me returned the user (Chrome, parallel runs)',
  },
};

// Not tested: a profile update clears the house number. The profile form has
// no house number field and its PUT /users/{id} doesn't send it, so a house
// number set at registration becomes null after any profile update.
