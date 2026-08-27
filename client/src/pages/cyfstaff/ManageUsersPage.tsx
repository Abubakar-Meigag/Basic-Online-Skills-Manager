import { useState, useEffect, useCallback, useMemo } from "react";
// What it is: These are the standard "power tools" that come with React.
// Why:
// useState: To remember things (like the list of users or what the user typed in search).
// useEffect: To trigger actions (like "fetch the users as soon as the page opens").
// useCallback & useMemo: To save energy. They help the app run faster by making sure the computer doesn't redo difficult work unless something actually changes.
import { api } from "../../auth/authApi";
// What it is: A pre-configured "phone" used to call your Backend.
// Why: Instead of writing the full address of your server every time, you use this api tool. It already knows where the server is and automatically attaches your "ID card" (login token) to every message.
import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
// What it is: Finished "Lego blocks" built by you or your team.
// Why:
// DataTable: Someone already wrote the complex code to show a table. You are just importing it to use it here.
// PageHeader: Keeps the titles and descriptions looking the same on every page of your app.
import type { TableColumn } from "../../components/DataTable";
import type { User } from "../../data/dataType";
// What it is: These are not "actions," they are definitions. Notice the word type.
// Why: They act like a dictionary. They tell the computer: "A User must have an ID, an Email, and a Name." 
// If you try to use a property that doesn't exist (like user.phoneNumber), TypeScript will give you a red underline to prevent a bug.
import AddUserForm from "./addPartner/AddUserForm";
// What it is: A separate file that contains the form for creating a new user.
// Why: To keep the ManageUsersPage from getting too long and messy. When the user clicks "Add User," this page just "swaps" its view to show this form.
import statusLabel from "../../utils/statusLabel";
import { userOrPartnerStatusStyles } from "../../lib/constants/userOrPartnerStatusStyles";
// What it is: Logic and CSS styles for the "Active/Inactive" tags.
// Why:
// statusLabel: A function that decides: "If the status is 'active', use the green color logic."
// userOrPartnerStatusStyles: A file that actually holds the specific CSS colors.


// The State Variables. These lines are the "memory" of your component.
const ManageUsersPage = () => {
  // Explanation: This starts the definition of your page. In React, a page is just a big function that returns some HTML.
  const [activeForm, setActiveForm] = useState<"none" | "user">("none");
  // Explanation: This controls what the user sees on the screen.
  // Why: If it's "none", we show the table. If it's "user", we hide the table and show the "Add User" form. It starts as "none" because we want to see the table first.
  const [users, setUsers] = useState<User[]>([]);
  // Explanation: This is an empty "bucket" waiting to be filled with people from the database.
  // Why: We start with an empty list []. Once the backend sends us the data, we use setUsers to put that data into this bucket.
 
  // Imagine you order a "Memory Kit" from the React store (useState). When the
  // package arrives at your door, you open it and find exactly two things inside:

  // 1.  The Item: (In this case, the users list).
  // 2.  The Remote Control: A special tool made specifically to change that one item
  //     (setUsers).

  // 2. Array Destructuring (The JavaScript part)

  // The useState function always returns an Array with two elements.

  //   - Instead of writing:
  //     const result = useState([]);
  //     const users = result[0];    // The item
  //     const setUsers = result[1]; // The remote control
  //   - We use a shortcut called Destructuring:
  //     const [users, setUsers] = useState([]);

  // 3. Who "creates" the function?

  // React creates the function for you. When you call useState, React's internal
  // code generates a brand new function in the background. It doesn't have a name
  // inside React; it just knows: "If someone calls this specific function, I need to
  // update the users variable and then re-render the page."

  // You give it the name setUsers on the left side of the = sign. You could actually
  // name it updateThePeopleList, but the standard rule (convention) in React is to
  // always use the word "set" followed by the variable name.

  // This is a very important line because it combines React (the logic) with
  // TypeScript (the rules).

  // Explanation of useState<User[]>([])

  // 1. useState(...)

  // This is the React part. It tells the computer: "I need you to remember some
  // information for me, and if this information changes, I want you to refresh the
  // screen."

  // 2. <User[]>

  // This is the TypeScript part. It is called a Type Generic.

  //   - User: This refers to the "blueprint" you imported at the top of the file. It
  //     tells the computer that every item in this list must look like a User
  //     (having an email, id, name, etc.).
  //   - []: These square brackets mean "List" (or Array).
  //   - Together <User[]>: You are telling TypeScript: "I am signing a contract with
  //     you. I promise that this 'bucket' will only ever hold a list of Users. Never
  //     a single number, never a string, only a list of Users."

  // 3. ([])

  // This is the Initial Value.

  //   - When the page first loads, we haven't talked to the backend yet, so we don't
  //     have any users.
  //   - We start with an empty array [].

  // Why do we need that <User[]> part?

  // Imagine you accidentally tried to write this code later: setUsers("Hello World")

  // 1.  Without <User[]>: TypeScript might not notice the mistake. Your app would
  //     crash later when the table tries to "map" over a string instead of a list.
  // 2.  With <User[]>: TypeScript will immediately give you a red underline and say:
  //     "Hey! You promised this bucket would only hold a list of Users, but you are
  //     trying to put a string in it!"

  // It catches your mistakes before you even run the code.

  // 🧠 ITP Logic Check:

  // If the blueprint for a User looks like this: { name: string, email: string }.

  // Which of these would TypeScript allow you to put into your users bucket?

  // 1.  { name: "John", email: "john@test.com" }
  // 2.  [{ name: "John", email: "john@test.com" }]

  // Think carefully! (Hint: Look at the [] in the type definition User[]).


  const [isLoading, setIsLoading] = useState(true);
  // Explanation: This tracks if we are currently waiting for the backend to answer.
  // Why: It starts as true. We use this to show a "Loading..." message on the screen so the user knows the app hasn't crashed while waiting for the internet.
  const [searchTerm, setSearchTerm] = useState("");
  // Explanation: This remembers exactly what the user has typed into the search bar.
  // Why: Every time you press a key in the search box, this "memory" updates so we can filter the list of users.


  // The Search Logic (useMemo). This is how we take the big list of users and show only the ones the user is looking for.
  const filteredUsers = useMemo(() => {
    // Explanation: useMemo is like a "Smart Save Button."
    // Why: Filtering a long list of users can be hard work for a computer. 
    // useMemo tells React: "Calculate this filtered list once, and remember it. Don't do the work again unless the users list or the searchTerm changes."
    return users.filter((user) => {
      const search = searchTerm.toLowerCase();
      // Explanation: We turn the user's search text into lowercase letters.
      // Why: Computers are picky! To a computer, "CYF" and "cyf" are different. By making everything lowercase, 
      // it doesn't matter if the user types with capital letters or not; the search will still work.

      const orgName = (user.organisation_name || "N/A").toLowerCase();
      const emailName = (user.email || "N/A").toLowerCase();
      const statusText = user.is_active ? "active" : "Inactive";
      // Explanation: We prepare the user's data (Name, Email, and Status) by also turning them into lowercase.
      // Why: If the database has "VOLUNTEER@cyf.org", we want it to match if the user searches for "volunteer".

      return (
        orgName.includes(search) ||
        emailName.includes(search) ||
        statusText.includes(search)
        // Explanation: This is the Final Test.
        // Why: It asks: "Does the name, OR the email, OR the status include the letters the user typed?" If any of these are true, that user is added to the filteredUsers list.
      );
    });
  }, [users, searchTerm]); // The [users, searchTerm] at the end: This is the "Watching List." React only re-runs this logic if one of these two things changes.
  // ITP Logic Check:
  // Imagine you have a user named "Alice" in your list.
  // The user types "ali" into the search box.
  // searchTerm becomes "ali".
  // The computer runs filteredUsers.
  // Based on the code above, will "Alice" show up in the results? Why or why not?
  // Answer: Because you used .toLowerCase(), "Alice" becomes "alice", and since "alice" includes "ali", she stays on the screen. Great job.


  // This is how the frontend actually asks the backend for data.
  const getUsers = useCallback(async () => {
    // Explanation: useCallback is like a "Stored Recipe."
    // Why: It tells React: "Remember how to do this action, and don't change the recipe unless I tell you to."
    // async: This is a keyword that tells the computer: "Wait! We are talking to the internet. This might take a few seconds, so don't freeze the whole app while we wait."
    try {
      setIsLoading(true);
      // Explanation: This is the "Starting the Work" phase.
      // Why: We use try as a safety net. It says: "Try to do these things, but if something goes wrong, jump to the catch block." We set isLoading to true so the user sees a "Loading..." message.
      const res = await api.get("/users");
      // Explanation: This is the Actual Phone Call to the Backend.
      // Why:
      // api.get("/users"): Sends a GET request to the server asking for the user list.
      // await: Tells the computer: "Wait here until the server answers."
      // res: This variable holds the Response (the letter the server sent back).
      // In this project, the api tool you imported from ../../auth/authApi is using a library called Axios.
      // Axios is a "Smart" tool. One of its main features is that it automatically parses the JSON for you.
      // As soon as the message arrives from the server, Axios sees the Header Content-Type: application/json and says: "I know what to do!" It turns the text into a JavaScript object before it even hands it to you.
      // That is why we can just do res.data. The "parsing" work is already done by the library.
      setUsers(res.data || []);
      // Explanation: We take the data the server sent back and put it in our bucket (users).
      // Why: res.data is the list of users. The || [] is a backup; if the server sends nothing, we just use an empty list so the app doesn't crash.
    } catch (error) {
      console.error("Error fetching users:", error);
      // Explanation: This is the bottom of the Safety Net.
      // Why: If the server is down or the internet fails, the code inside try will stop, and the catch block will run instead. This prevents your whole website from turning white/crashing.
    } finally {
      setIsLoading(false);
      // Explanation: finally means "No matter what happened."
      // Why: Whether the request worked OR it failed, we want to stop showing the "Loading..." message.
    }
  }, []); // The [] at the end: this tells React to only create this function once when the page first loads.

  // Updating a User (handleStatusChange). This is where we tell the backend to change something that already exists.
  const handleStatusChange = useCallback(
    async (userId: string, newStatus: boolean) => {
      // Explanation: Another stable, asynchronous function.
      // Why: This function needs two pieces of information: "Who" (the userId) and "What" (the newStatus, which is true or false).
      try {
        await api.patch(`/users/${userId}/status`, { is_active: newStatus });
        // Explanation: This is an HTTP PATCH request.
        // Why:
        // PATCH: Unlike GET (which reads data), PATCH is used to edit a small part of an existing record.
        // The URL: Notice the ${userId}. This is a "Template Literal." It puts the specific user's ID directly into the web address so the backend knows exactly which person to update.
        // The Body { is_active: newStatus }: This is the data we are sending. We are telling the server: "Find the is_active column and change it to this new value."

        getUsers();
        // Explanation: This is the "Sync" step.
        // Why: After the backend successfully updates the database, our frontend "bucket" (users) is now out of date. By calling getUsers() again, we fetch the fresh, updated data from the server so the screen reflects the change.
      } catch (error) {
        console.error("Failed to update status:", error);
        alert("Could not update user status. Please try again.");
        // Explanation: The error handler.
    // Why: If the database update fails (maybe the database is locked or the user has no permission), we show an alert to the user so they know their change wasn't saved.
      }
    },
    [getUsers],
    // The [getUsers] at the end: This tells React: "This function depends on the getUsers function. If getUsers ever changes, recreate this function too."
    // To understand why [getUsers] is in the "watching list" (dependency array) of handleStatusChange, let's use an analogy.
    // The "Phone Number" Analogy
    // Imagine you have a personal assistant named "HandleStatusChange." You tell this assistant: "Whenever you finish updating a user's status, I want you to call the GetUsers department to refresh the list."
    // The Reference: To do this, the assistant needs the phone number for the "GetUsers" department.
    // The Change: Now, imagine the "GetUsers" department gets a brand new phone number (the function is recreated in React).
    // The Problem: If the assistant keeps using the old phone number, they might be calling a dead line, or an old version of the department that doesn't work correctly anymore.
    // The Dependency: By putting [getUsers] in the dependency array, you are telling React: "If the 'GetUsers' department ever changes its number, give my assistant the new number immediately."
    // If we left the array empty [], handleStatusChange would "capture" the version of getUsers that existed the very first time the page loaded. If getUsers was ever updated later (maybe to include new security logic), handleStatusChange wouldn't know. 
    // It would still be using the old version of the function.
    // In professional programming, we follow a rule: If you use a variable or a function inside a hook, you MUST list it in the dependencies.
    // Even if it doesn't change today, someone (maybe even you!) might change the code tomorrow to make it more dynamic. If you forgot to list the dependency, the app would have a "Stale Closure" bug—it would keep trying to fetch the old data instead of the new filtered data.
  );

  const columns = useMemo(
    (): TableColumn<User>[] => [
      {
        header: "ID",
        accessor: "id",
        cellClassName: "text-xs text-gray-600 font-mono",
        render: (value) => String(value).slice(0, 5),
      },
      {
        header: "Organisation Name",
        accessor: "organisation_name",
        render: (value) => value || "N/A",
      },
      {
        header: "Email Address",
        accessor: "email",
        cellClassName: "font-medium text-[#333333]",
      },
      {
        header: "Status",
        accessor: "is_active",
        render: (isActive, row) => {
          const statusKey = isActive ? "active" : "not_active";
          const { statusStyle } = statusLabel(
            statusKey,
            userOrPartnerStatusStyles,
          );

          return (
            <select
              value={statusKey}
              onChange={(e) =>
                handleStatusChange(row.id, e.target.value === "active")
              }
              className={`cursor-pointer rounded-sm px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 ${statusStyle}`}
            >
              <option value="active">Active</option>
              <option value="not_active">Inactive</option>
            </select>
          );
        },
      },
    ],
    [handleStatusChange],
  );

  useEffect(() => {
    if (activeForm === "none") {
      getUsers();
    }
  }, [getUsers, activeForm]);

  if (activeForm === "user") {
    return (
      <AddUserForm
        onBack={() => setActiveForm("none")}
        onCreated={() => setActiveForm("none")}
      />
    );
  }

  return (
    <section className="p-6">
      <div className="sticky top-0 z-20 bg-white px-8 pt-2 pb-1">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Manage Users"
            description="All registered users for the various organizations"
          />

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by org, email or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setActiveForm("user")}
              className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              Add User
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2 overflow-y-auto rounded-lg border border-gray-200 bg-white max-h-[calc(100vh-150px)]">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          <DataTable data={filteredUsers} columns={columns} />
        ) : (
          <div className="p-10 text-center text-gray-500">
            {searchTerm
              ? `No users matching "${searchTerm}"`
              : "No users found."}
          </div>
        )}
      </div>
    </section>
  );
};

export default ManageUsersPage;
