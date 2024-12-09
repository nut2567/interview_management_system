import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    async function fetchData() {}
    fetchData();
  }, []);
  const jsonwebtokenLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/login", {
        username: username,
        password: password,
      });
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>", res);

      if (res.statusText != "OK") {
        throw new Error("Login failed");
      }
      localStorage.setItem("token", res.data.token);
    } catch (error) {
      setError("Invalid username or password");
      console.log(error);
    }
  };
  return (
    <div className="">
      <main className="flex min-h-screen flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="min-h-screen w-full  flex items-center justify-center">
          <div className=" bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 className="text-2xl font-semibold text-center mb-6">
              Login to Your Account
            </h1>
            <form onSubmit={jsonwebtokenLogin}>
              <div className="mb-4">
                <label
                  className="block text-gray-100 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <div className="flex items-center">
                  <i className="material-icons items-center flex mr-2">
                    person
                  </i>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                    id="username"
                    className="w-full rounded-md"
                    placeholder="Enter your username"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  className="block text-gray-100 text-sm font-bold mb-2"
                  htmlFor="password"
                >
                  Password
                </label>

                <div className="flex items-center">
                  <i className="material-icons items-center flex mr-2">lock</i>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    id="password"
                    className="w-full rounded-md focus:outline-none"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 w-full"
                >
                  Login
                </button>
              </div>
            </form>
            {error && (
              <div className="text-red-500 mt-3 flex justify-center">
                {/* <p>{{ error }}</p> */}
              </div>
            )}

            <div className="mt-6 text-center">
              <a href="#" className="text-blue-500 hover:underline">
                Forgot your password?
              </a>
              <p className="mt-2 text-gray-600">
                Don&apos;t have an account?
                <a href="#" className="text-blue-500 hover:underline">
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
