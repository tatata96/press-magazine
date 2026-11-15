"use client";

import {useEffect} from "react";
import {useLoadingScreen} from "./LoadingProvider";

export default function LoadingScreen({
  label,
  subtle = false,
}: {
  label: string;
  subtle?: boolean;
}) {
  const register = useLoadingScreen();

  useEffect(() => register({label, subtle}), [register, label, subtle]);

  return null;
}
