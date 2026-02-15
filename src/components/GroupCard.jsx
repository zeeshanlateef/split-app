import { useEffect, useState } from "react";
import { createGroup, getGroups, deleteGroup } from "../services/groupService";
import { toast } from "react-toastify";

export default function GroupManager() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");

  const load = async () => {
    const res = await getGroups();
    setGroups(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const addGroup = async () => {
    if (!name) {
      toast.error("Group name required");
      return;
    }

    await createGroup({
      name,
      members: [],
      createdAt: Date.now(),
    });

    setName("");
    toast.success("Group created");
    load();
  };

  const remove = async (id) => {
    await deleteGroup(id);
    toast.info("Group removed");
    load();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Groups</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
        />

        <button
          onClick={addGroup}
          className="bg-green-500 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      {groups.map((g) => (
        <div
          key={g.id}
          className="flex justify-between bg-gray-100 p-3 rounded mb-2"
        >
          {g.name}

          <button
            onClick={() => remove(g.id)}
            className="text-red-500"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
