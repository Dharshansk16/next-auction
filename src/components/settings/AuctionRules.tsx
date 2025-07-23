import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuctionContext } from "@/contexts/AuctionContext";

export default function AuctionRules() {
  const { auctionRules, setAuctionRules } = useAuctionContext();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Auction Rules</CardTitle>
        <CardDescription>Configure global auction settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="min-bid">Minimum Bid Increment</Label>
          <Input
            id="min-bid"
            type="number"
            value={auctionRules.minBidIncrement}
            onChange={(e) =>
              setAuctionRules({
                ...auctionRules,
                minBidIncrement: Number.parseInt(e.target.value) || 1,
              })
            }
          />
          <p className="text-sm text-gray-500">
            The minimum amount that can be bid for any player
          </p>
        </div>
        <Button
          onClick={() => {
            localStorage.setItem(
              "cricket-auction-rules",
              JSON.stringify(auctionRules)
            );
            alert("Settings saved!");
          }}
        >
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}
