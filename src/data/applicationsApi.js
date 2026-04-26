import { supabase } from "../lib/supabase";

export async function fetchApplications() {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchApplicationById(publicId) {
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("public_id", publicId)
    .maybeSingle();

  if (error) throw error;
  return data;
}