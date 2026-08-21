export type Challenge = {
  id: string;
  task: string;
  active: boolean;
  created_at: string;
};

export type Photo = {
  id: string;
  challenge_id: string;
  image_url: string;
  created_at: string;
  guest_name: string | null;
  challenge: Challenge;
};
