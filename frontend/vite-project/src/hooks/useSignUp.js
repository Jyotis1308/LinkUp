
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { signup } from "../lib/api";

const useSignUp = () => {
 const queryClient = useQueryClient();
  const navigate=useNavigate();

 const {mutate,isPending,error}=useMutation({
  mutationFn:signup,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["authUser"] });
    navigate("/"); 
  },
  })
return {isPending, error, signupMutation:mutate};
}

export default useSignUp;