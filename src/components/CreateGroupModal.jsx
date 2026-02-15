import { useForm } from "react-hook-form";
import { createGroup } from "../services/groupService";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const CreateGroupModal = ({ close, refresh }) => {

  const { register, handleSubmit } = useForm();
  const { user } = useAuth();

  const onSubmit = async (data) => {

    await createGroup({
      name: data.name,
      members: [user.id]
    });

    toast.success("Group created");
    refresh();
    close();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded-xl w-11/12 md:w-96">

        <h2 className="text-xl font-bold mb-4">Create Group</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register("name")}
            placeholder="Group name"
            className="w-full border p-3 rounded mb-4"
          />

          <button className="w-full bg-emerald-500 text-white p-3 rounded">
            Create
          </button>
        </form>

      </div>
    </div>
  );
};

export default CreateGroupModal;
