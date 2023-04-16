// src/app.js

import { Auth, getUser } from "./auth";
import {
  deleteFragment,
  getFragment,
  getFragmentMeta,
  getUserFragments,
  postFragments,
  putFragment,
} from "./api";

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const getButton = document.querySelector("#getall");
  const postButton = document.querySelector("#post");
  const content = document.querySelector("#content");
  const contentType = document.querySelector("#type");
  const fragments_id = document.querySelector("#fragments_id");
  const deleteButton = document.querySelector("#delete");
  const fragment_id = document.querySelector("#fragment_id");
  const upd_content = document.querySelector("#upd_content");
  const putButton = document.querySelector("#update");
  const get_id = document.querySelector("#get_id");
  const getById = document.querySelector("#getbyid");
  const getInfo = document.querySelector("#getInfo");
  const fileUpload = document.querySelector("#file");
  const metaData = document.querySelector("#fragments");
  const infoData = document.querySelector("#content-type");

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

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
  // Do an authenticated request to the fragments API server and log the result
  getButton.onclick = async () => {
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
  getById.onclick = async () => {
    var res = await getFragment(user, get_id.value);
    if (res instanceof Blob) {
      const image = document.createElement("img");
      image.src = URL.createObjectURL(res);
      infoData.innerHTML = "";
      infoData.appendChild(image);
    } else {
      infoData.innerHTML = res;
    }
  };
  getInfo.onclick = async () => {
    var res = await getFragmentMeta(user, get_id.value);
    if (res instanceof Blob) {
      const image = document.createElement("img");
      image.src = URL.createObjectURL(res);
      infoData.appendChild(image);
    }
    infoData.innerHTML = JSON.stringify(res);
  };
  postButton.onclick = async () => {
    if (content.value.trim() === "") {
      const file = fileUpload.files[0];
      // Read the file using the FileReader API
      const reader = new FileReader();
      if (
        contentType.options[contentType.selectedIndex].value.startsWith("image")
      ) {
        reader.onload = function (event) {
          // Get the file data as a base64 encoded string
          const imageData = event.target.result;
        };

        // Read the file as a DataURL
        await postFragments(
          user,
          contentType.options[contentType.selectedIndex].value,
          reader.readAsDataURL(file)
        );
      } else {
        reader.readAsText(file);
        reader.onload = async function () {
          const content = reader.result;
          // Send the file to the server
          console.log("content", content.length);
          await postFragments(
            user,
            contentType.options[contentType.selectedIndex].value,
            content
          );
        };
      }
    } else {
      let data = content.value;
      let contentTypeValue =
        contentType.options[contentType.selectedIndex].value;

      await postFragments(user, contentTypeValue, data);
    }
  };

  deleteButton.onclick = () => {
    deleteFragment(user, fragments_id.value);
  };
  putButton.onclick = async () => {
    putFragment(
      user,
      fragment_id.value,
      contentType.options[contentType.selectedIndex].value,
      upd_content.value
    );
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);
