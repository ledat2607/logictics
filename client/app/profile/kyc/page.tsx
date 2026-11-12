"use client";
import React from "react";
import KYCForm from "@/components/user/profile/kyc-form";
import { useAuth } from "@/hooks/user-auth";

const KYCPage = () => {
  const { user } = useAuth();

  return <>{user && <KYCForm user={user} />}</>;
};

export default KYCPage;
