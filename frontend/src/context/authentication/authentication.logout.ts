export const DOMINO_LOGOUT = "DOMINO_LOGOUT";

const event = new CustomEvent(DOMINO_LOGOUT, {
  bubbles: true,
  cancelable: true,
  detail: {
    message: "Logout",
  },
});

export const dispatchLogout = () => {
  window.dispatchEvent(event);
};
