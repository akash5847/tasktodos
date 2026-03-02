import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import AppRoutes from "./AppRoutes";
import Menu from "./Dashboard/Menu/Menu";
import Content from "./Dashboard/Contents/Content";
import db from "./firebase";

const ALLOWED_ADMIN_ACCOUNTS = [
  {
    name: "akash",
    email: "akash@gmail.com",
    password: "akash",
    role: "admin",
  },
  {
    name: "rohan",
    email: "rohan@gmail.com",
    password: "rohan",
    role: "admin",
  },
];

// Define the Layout outside so it doesn't get re-created
const DashboardLayout = ({
  currentUser,
  handleLogout,
  setActiveSection,
  tags,
  setTags,
  handleRenameTag,
  handleDeleteTag,
  tasks,
  handleSaveTask,
  handleUpdateTask,
  handleDeleteTask,
  activeSection,
  selectedTask,
  setSelectedTask,
  canViewSettings,
}) => (
  <div className="app-shell">
    <Menu
      user={currentUser}
      onLogout={handleLogout}
      setActiveSection={setActiveSection}
      activeSection={activeSection}
      tasks={tasks}
      tags={tags}
      setTags={setTags}
      onRenameTag={handleRenameTag}
      onDeleteTag={handleDeleteTag}
      canViewSettings={canViewSettings}
    />
    <main className="app-main">
      <Content
        activeSection={activeSection}
        tasks={tasks}
        handleSaveTask={handleSaveTask}
        handleUpdateTask={handleUpdateTask}
        handleDeleteTask={handleDeleteTask}
        tags={tags}
        setTags={setTags}
        handleRenameTag={handleRenameTag}
        handleDeleteTag={handleDeleteTag}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        canViewSettings={canViewSettings}
      />
    </main>
  </div>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeSection, setActiveSection] = useState("today");
  const [tasks, setTasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [adminSeeded, setAdminSeeded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }

    const matchedAdmin = ALLOWED_ADMIN_ACCOUNTS.some(
      (admin) =>
        currentUser.email === admin.email &&
        currentUser.name?.toLowerCase() === admin.name &&
        currentUser.password === admin.password &&
        currentUser.role === admin.role,
    );
    setIsAdmin(matchedAdmin);
  }, [currentUser]);

  const canViewSettings = isAdmin;

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      if (!db) {
        if (isMounted) setIsAuthReady(true);
        return;
      }

      try {
        const usersRef = collection(db, "users");
        const loggedInQuery = query(usersRef, where("isLoggedIn", "==", true));
        const snapshot = await getDocs(loggedInQuery);

        if (!isMounted) return;

        if (snapshot.empty) {
          setCurrentUser(null);
          return;
        }

        const loggedInUsers = snapshot.docs.map((userDoc) => ({
          id: userDoc.id,
          ...userDoc.data(),
        }));

        const latestLoggedInUser = loggedInUsers.sort((a, b) => {
          const aLogin = Date.parse(a.lastLoginAt || "") || 0;
          const bLogin = Date.parse(b.lastLoginAt || "") || 0;
          return bLogin - aLogin;
        })[0];

        setCurrentUser(latestLoggedInUser);
      } catch (error) {
        console.error("Failed to restore Firebase session:", error);
      } finally {
        if (isMounted) setIsAuthReady(true);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (canViewSettings) return;
    if (activeSection === "settings") {
      setActiveSection("today");
    }
  }, [activeSection, canViewSettings]);

  useEffect(() => {
    if (!db || !currentUser || !currentUser.id) {
      setTasks([]); // Clear tasks if no one is logged in
      setTags([]);
      return;
    }

    // 1. Reference the tasks collection
    const tasksRef = collection(db, "tasks");

    // 2. Query only tasks belonging to the current user
    // (Assuming you save tasks with a 'userId' field)
    const q = query(tasksRef, where("userId", "==", currentUser.id));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    const taskTagNames = Array.from(
      new Set(
        tasks.flatMap((task) => {
          if (Array.isArray(task.tags)) {
            return task.tags.map((tag) =>
              typeof tag === "string" ? tag.trim() : "",
            );
          }

          if (typeof task.tag === "string") {
            return [task.tag.trim()];
          }

          return [];
        }).filter(Boolean),
      ),
    );

    if (!taskTagNames.length) return;

    setTags((prevTags) => {
      const existing = new Set(prevTags.map((tag) => tag.name));
      const missing = taskTagNames.filter((name) => !existing.has(name));

      if (!missing.length) return prevTags;

      const generated = missing.map((name) => ({
        id: `task-tag-${name.toLowerCase().replace(/\s+/g, "-")}`,
        name,
      }));

      return [...prevTags, ...generated];
    });
  }, [tasks]);

  useEffect(() => {
    if (!db || adminSeeded) return;

    const seedAdmins = async () => {
      const usersRef = collection(db, "users");
      const results = await Promise.allSettled(
        ALLOWED_ADMIN_ACCOUNTS.map(async (admin) => {
          const adminQuery = query(usersRef, where("email", "==", admin.email));
          const snapshot = await getDocs(adminQuery);
          if (!snapshot.empty) return;
          await addDoc(usersRef, { ...admin, isLoggedIn: false });
        }),
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.error(
            `Failed to seed admin user ${ALLOWED_ADMIN_ACCOUNTS[index].email}:`,
            result.reason,
          );
        }
      });

      setAdminSeeded(true);
    };

    seedAdmins();
  }, [adminSeeded]);

  const handleSaveUser = async (userData) => {
    const userPayload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      isLoggedIn: userData.isLoggedIn,
      lastLoginAt: userData.isLoggedIn ? new Date().toISOString() : null,
    };

    if (!db) {
      const localUser = { id: Date.now().toString(), ...userPayload };
      setUsers((prevUsers) => [...prevUsers, localUser]);
      return localUser;
    }

    const docRef = await addDoc(collection(db, "users"), userPayload);
    return { id: docRef.id, ...userPayload };
  };

  const handleDeleteUser = async (userId) => {
    if (!db) {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      if (currentUser?.id === userId) setCurrentUser(null);
      return;
    }

    await deleteDoc(doc(db, "users", userId));
    if (currentUser?.id === userId) setCurrentUser(null);
  };

  const handleLoginSuccess = (userData) => setCurrentUser(userData);

  const handleLogout = async () => {
    if (!currentUser) {
      setCurrentUser(null);
      return;
    }

    if (!db) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.email === currentUser.email
            ? { ...user, isLoggedIn: false, lastLogoutAt: new Date().toISOString() }
            : user,
        ),
      );
    } else if (currentUser.id) {
      await updateDoc(doc(db, "users", currentUser.id), {
        isLoggedIn: false,
        lastLogoutAt: new Date().toISOString(),
      });
    } else if (currentUser.email) {
      const usersRef = collection(db, "users");
      const byEmailQuery = query(
        usersRef,
        where("email", "==", currentUser.email),
      );
      const snapshot = await getDocs(byEmailQuery);

      await Promise.all(
        snapshot.docs.map((userDoc) =>
          updateDoc(doc(db, "users", userDoc.id), {
            isLoggedIn: false,
            lastLogoutAt: new Date().toISOString(),
          }),
        ),
      );
    }

    setCurrentUser(null);
  };

  // Inside App.jsx

  const handleSaveTask = async (taskData) => {
    if (!db || !currentUser) return;

    try {
      const normalizedTags = Array.isArray(taskData.tags)
        ? taskData.tags.filter(Boolean)
        : [];
      const completedValue = taskData.completed ?? taskData.done ?? false;
      const bookmarkedValue = taskData.bookmarked ?? false;

      // Prepare the data for Firestore
      const taskPayload = {
        subject: taskData.subject || "",
        text: taskData.task ?? taskData.text ?? "",
        tags: normalizedTags,
        time: taskData.dueDate ?? taskData.time ?? null,
        userId: currentUser.id, // Links task to this specific user
        completed: completedValue,
        done: completedValue,
        bookmarked: bookmarkedValue,
        updatedAt: new Date().toISOString(),
      };

      const isExistingTask =
        taskData.id !== undefined &&
        taskData.id !== null &&
        tasks.some((task) => task.id === taskData.id);

      if (isExistingTask) {
        await updateDoc(doc(db, "tasks", taskData.id), taskPayload);
      } else {
        // It's a NEW task
        taskPayload.createdAt = new Date().toISOString();
        await addDoc(collection(db, "tasks"), taskPayload);
      }

    } catch (error) {
      console.error("Error saving task to Firestore:", error);
      alert("Could not save task. Check your connection.");
    }
  };

  const handleRenameTag = async (oldName, newName) => {
    const trimmedOld = typeof oldName === "string" ? oldName.trim() : "";
    const trimmedNew = typeof newName === "string" ? newName.trim() : "";
    if (!trimmedOld || !trimmedNew || trimmedOld === trimmedNew) return;

    const renameInTask = (task) => {
      const taskTags = Array.isArray(task.tags) ? task.tags : [];
      const hasTag = taskTags.includes(trimmedOld);
      if (!hasTag) return null;

      const renamed = taskTags.map((tagName) =>
        tagName === trimmedOld ? trimmedNew : tagName,
      );
      return [...new Set(renamed)];
    };

    const affectedTasks = tasks
      .map((task) => ({ task, updatedTags: renameInTask(task) }))
      .filter(({ updatedTags }) => Array.isArray(updatedTags));

    setActiveSection((prev) => {
      if (prev && typeof prev === "object" && prev.name === trimmedOld) {
        return { ...prev, name: trimmedNew };
      }
      return prev;
    });

    if (!affectedTasks.length) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        const renamed = renameInTask(task);
        return renamed ? { ...task, tags: renamed } : task;
      }),
    );

    try {
      if (!db) return;

      await Promise.all(
        affectedTasks.map(({ task, updatedTags }) =>
          updateDoc(doc(db, "tasks", task.id), {
            tags: updatedTags,
            updatedAt: new Date().toISOString(),
          }),
        ),
      );
    } catch (error) {
      console.error("Error renaming tag in tasks:", error);
    }
  };

  const handleDeleteTag = async (tagName) => {
    const trimmedTag = typeof tagName === "string" ? tagName.trim() : "";
    if (!trimmedTag) return;

    setActiveSection((prev) => {
      if (prev && typeof prev === "object" && prev.name === trimmedTag) {
        return "today";
      }
      return prev;
    });

    setTags((prevTags) =>
      prevTags.filter((tag) => tag.name.toLowerCase() !== trimmedTag.toLowerCase()),
    );

    const removeFromTask = (task) => {
      const taskTags = Array.isArray(task.tags) ? task.tags : [];
      if (!taskTags.length) return null;

      const updatedTags = taskTags.filter((name) => name !== trimmedTag);
      return updatedTags.length === taskTags.length ? null : updatedTags;
    };

    const affectedTasks = tasks
      .map((task) => ({ task, updatedTags: removeFromTask(task) }))
      .filter(({ updatedTags }) => Array.isArray(updatedTags));

    if (!affectedTasks.length || !db) return;

    try {
      await Promise.all(
        affectedTasks.map(({ task, updatedTags }) =>
          updateDoc(doc(db, "tasks", task.id), {
            tags: updatedTags,
            updatedAt: new Date().toISOString(),
          }),
        ),
      );
    } catch (error) {
      console.error("Error deleting tag from tasks:", error);
    }
  };

  // Also add a Delete function while we are here!
  const handleDeleteTask = async (taskId) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      if (selectedTask?.id === taskId) setSelectedTask(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <AppRoutes
      currentUser={currentUser}
      isAuthReady={isAuthReady}
      users={users}
      handleLogout={handleLogout}
      handleLoginSuccess={handleLoginSuccess}
      handleSaveUser={handleSaveUser}
      handleDeleteUser={handleDeleteUser}
      DashboardLayout={DashboardLayout}
      dashboardProps={{
        currentUser,
        handleLogout,
        setActiveSection,
        tags,
        setTags,
        handleRenameTag,
        handleDeleteTag,
        tasks,
        // Point both props to the same logic since handleSaveTask handles updates
        handleSaveTask: handleSaveTask,
        handleUpdateTask: handleSaveTask,
        handleDeleteTask,
        activeSection,
        selectedTask,
        setSelectedTask,
        handleDeleteUser,
        canViewSettings,
      }}
    />
  );
}
