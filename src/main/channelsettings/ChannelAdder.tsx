import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPresets } from "./channelSettingsUtils";

export function ChannelAdder({
  onAddChannel,
  userId,
  handleSaveSettings,
  channelsUpdated,
}: {
  onAddChannel: (newChannelData: any) => void;
  userId: string;
  handleSaveSettings: (
    channelKey: string,
    newSettings: any
  ) => Promise<string | void>;
  channelsUpdated: number;
}) {
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [defaultPresets, setDefaultPresets] = useState<Record<string, any>>({});
  const [userChannels, setUserChannels] = useState<Record<string, any>>({});
  const [combinedPresets, setCombinedPresets] = useState<Record<string, any>>(
    {}
  );

  const fetchPresetsData = useCallback(() => {
    if (userId) {
      fetchPresets(userId)
        .then((data) => {
          if (!data || (!data.presets && !data.userChannels)) {
            console.error("Invalid data structure received from fetchPresets");
            return;
          }
          setDefaultPresets(data.presets || {});
          setUserChannels(data.userChannels || {});
          setCombinedPresets({
            ...(data.presets || {}),
            ...(data.userChannels || {}),
          });
        })
        .catch((error) => {
          console.error("Error fetching presets:", error);
        });
    }
  }, [userId]);

  useEffect(() => {
    fetchPresetsData();
  }, [fetchPresetsData, channelsUpdated]);

  const handleAddChannel = async () => {
    const newChannelData = {
      id: newChannelName,
      ...combinedPresets[selectedPreset],
    };

    try {
      const result = await handleSaveSettings(newChannelName, newChannelData);
      if (result !== "not_modified") {
        onAddChannel(newChannelData); // This triggers the update
        setShowAddChannelModal(false);
        setNewChannelName("");
        setSelectedPreset("");
        fetchPresetsData();
      } else {
        console.error("Failed to add channel: No changes were made");
      }
    } catch (error) {
      console.error("Error adding channel:", error);
    }
  };

  return (
    <>
      <Button onClick={() => setShowAddChannelModal(true)}>
        Add New Channel
      </Button>
      <Dialog open={showAddChannelModal} onOpenChange={setShowAddChannelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Channel</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="preset" className="text-right">
                Preset
              </Label>
              <Select onValueChange={setSelectedPreset} value={selectedPreset}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a preset or channel" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(defaultPresets).length > 0 && (
                    <>
                      <SelectItem value="default_presets_header" disabled>
                        <div className="w-full text-center font-semibold text-base">
                          Default Presets
                        </div>
                      </SelectItem>
                      {Object.keys(defaultPresets).map((presetName) => (
                        <SelectItem key={presetName} value={presetName}>
                          {presetName}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {Object.keys(userChannels).length > 0 && (
                    <>
                      <SelectItem value="current_channels_header" disabled>
                        <div className="w-full text-center font-semibold text-base">
                          Current Channels
                        </div>
                      </SelectItem>
                      {Object.keys(userChannels).map((channelName) => (
                        <SelectItem key={channelName} value={channelName}>
                          {channelName}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {Object.keys(defaultPresets).length === 0 &&
                    Object.keys(userChannels).length === 0 && (
                      <SelectItem value="no_presets" disabled>
                        No presets or channels available
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddChannel}>Add Channel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}