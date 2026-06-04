const api = process.env.NEXT_PUBLIC_APP_URL;

// Subject
export const getSubjectsFetcher = async () => {
  const res = await fetch(`${api}/subjects`);

  switch (res.status) {
    case 200:
      const data = res.json();
      console.log(data);

      return data;
    default:
      throw new Error("Failed to fetch subjects");
  }
};

export const getSubjectByIdFetcher = async (id: string) => {
  const response = await fetch(`${api}/subjects/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch subject");
  }

  return response.json();
};

export const createSubjectFetcher = async (subjectData: any) => {
  const response = await fetch(`${api}/api/subjects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subjectData),
  });

  if (!response.ok) {
    throw new Error("Failed to create subject");
  }

  return response.json();
};

export const updateSubjectFetcher = async (id: string, subjectData: any) => {
  const response = await fetch(`${api}/api/subjects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(subjectData),
  });

  if (!response.ok) {
    throw new Error("Failed to update subject");
  }

  return response.json();
};

export const deleteSubjectFetcher = async (id: string) => {
  const response = await fetch(`${api}/api/subjects/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete subject");
  }

  return response.json();
};
