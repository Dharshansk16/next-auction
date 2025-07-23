"use client";

import { useAuctionData } from "@/hooks/useAuctionData";
import React, { createContext, useContext } from "react";

const AuctionContext = createContext<ReturnType<typeof useAuctionData> | null>(
  null
);

export const AuctionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auctionData = useAuctionData();
  return (
    <AuctionContext.Provider value={auctionData}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuctionContext = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error("useAuctionContext must be used within an AuctionProvider");
  }
  return context;
};
