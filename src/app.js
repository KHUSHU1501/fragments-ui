// src/app.js

import { Auth, getUser } from "./auth";
import { getUserFragments, postUserFragment } from "./api";

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const postBtn = document.querySelector("#post");
  const fragmentInput = document.querySelector("#fragmentInput");
  const getFragmentBtn = document.querySelector("#getFragmentBtn");
  const fragmentType = document.querySelector("#fragmentType");

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };
  postBtn.onclick = () => {
    // Post a new fragment to the fragments API server
    postUserFragment(user, fragmentInput.value, fragmentType.value);
  };

  getFragmentBtn.onclick = () => {
    // Get a fragment from the fragments API server
    let fragmentHtml = "";
    let fragmentList = document.querySelector(".fragmentList");
    fragmentList.innerHTML = "";
    getUserFragments(user).then((data) => {
      if (data.length) {
        // Create the titles for each column and add to the table
        let header = document.createElement("tr");
        let headerOptions = ["Id", "Created", "Updated", "Type"];
        for (let column of headerOptions) {
          let th = document.createElement("th");
          th.append(column);
          header.appendChild(th);
        }
        fragmentList.appendChild(header);

        for (let fragment of data) {
          console.log("fragment", fragment);

          let tr = document.createElement("tr");
          let id = document.createElement("td");
          let created = document.createElement("td");
          let updated = document.createElement("td");
          let type = document.createElement("td");

          id.append(fragment.id);
          created.append(fragment.created);
          updated.append(fragment.updated);
          type.append(fragment.type);
          tr.append(id, created, updated, type);

          fragmentList.appendChild(tr);
        }
      } else {
        let td = document.createElement("td");
        td.append("No fragments were found");

        fragmentList.append(td);
      }
    });
    fragmentList.html = fragmentHtml;
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);

  // Post a new fragment to the fragments API server

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
