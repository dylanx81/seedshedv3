"use client";

import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { PlantList } from "./_components/posts";
import { EmptyState } from "@/components/EmptyState";
import { StaggeredReveal } from "@/components/StaggeredReveal";
import { AnnouncerProvider } from "@/components/Announcer";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ScanSeedPacketModal } from "@/components/ScanSeedPacketModal";
import { ScanBarcodeModal } from "@/components/ScanBarcodeModal";
import { AddPlantModal } from "@/components/AddPlantModal";

export default function GardenDashboard() {
  const [hasPlants, setHasPlants] = useState(false); // Mock state - would come from actual data
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  const filters = [
    { id: "all", label: "All Plants" },
    { id: "growing", label: "Growing" },
    { id: "flowering", label: "Flowering" },
    { id: "ready", label: "Ready to Harvest" },
  ];

  const handleAddFirstPlant = () => {
    setIsScanModalOpen(true);
  };

  const handleTrySample = () => {
    // TODO: Add sample plants
    console.log("Add sample plants");
  };

  const handleAddManually = () => {
    setIsAddModalOpen(true);
  };

  return (
    <AnnouncerProvider>
      <div className="min-h-screen bg-gradient-to-br from-earth-50 via-sage-50 to-earth-100">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
          {/* Header */}
          <StaggeredReveal>
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-4xl font-bold text-earth-900 md:text-5xl">
                Digital Potting Shed
              </h1>
              <p className="mb-4 text-lg text-earth-700">Your Garden Journal</p>
              <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-sage-500 to-earth-500"></div>
            </div>
          </StaggeredReveal>

          {/* Search and Filters */}
          <StaggeredReveal delay={100}>
            <div className="mb-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-earth-400" />
                <input
                  type="text"
                  placeholder="Search your plants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-earth-200 bg-white/80 px-10 py-3 text-earth-900 placeholder-earth-500 backdrop-blur-sm focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2"
                />
              </div>

              {/* Filter chips */}
              <div className="flex flex-wrap gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedFilter === filter.id
                        ? "bg-sage-600 text-white"
                        : "bg-white/80 text-earth-700 hover:bg-sage-50 border border-earth-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </StaggeredReveal>

          {/* Garden Stats */}
          <StaggeredReveal delay={200}>
            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-earth-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="text-xs font-medium uppercase tracking-wide text-earth-700">
                  Total Plants
                </h3>
                <p className="text-2xl font-bold text-earth-900">12</p>
              </div>
              <div className="rounded-lg border border-sage-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="text-xs font-medium uppercase tracking-wide text-sage-700">
                  Growing
                </h3>
                <p className="text-2xl font-bold text-sage-900">8</p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="text-xs font-medium uppercase tracking-wide text-rose-700">
                  Flowering
                </h3>
                <p className="text-2xl font-bold text-rose-900">3</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                <h3 className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  Ready to Harvest
                </h3>
                <p className="text-2xl font-bold text-amber-900">1</p>
              </div>
            </div>
          </StaggeredReveal>

          {/* Main Content */}
          <StaggeredReveal delay={300}>
            <div className="rounded-xl border border-earth-200 bg-white/90 p-6 shadow-lg backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-earth-900">My Garden</h2>
                <div className="text-sm text-earth-600">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
              
              {hasPlants ? (
                <PlantList />
              ) : (
                <EmptyState
                  onAddFirstPlant={handleAddFirstPlant}
                  onTrySample={handleTrySample}
                  onAddManually={handleAddManually}
                />
              )}
            </div>
          </StaggeredReveal>

          {/* Floating Action Button */}
          {hasPlants && (
            <FloatingActionButton
              onScanSeedPacket={() => setIsScanModalOpen(true)}
              onScanBarcode={() => setIsBarcodeModalOpen(true)}
              onEnterManually={() => setIsAddModalOpen(true)}
            />
          )}

          {/* Footer */}
          <StaggeredReveal delay={400}>
            <div className="mt-8 text-center text-sm text-earth-600">
              <p>🌱 Growing together, one plant at a time</p>
            </div>
          </StaggeredReveal>
        </div>
      </div>

      {/* Modals */}
      <AddPlantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ScanSeedPacketModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />

      <ScanBarcodeModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
      />
    </AnnouncerProvider>
  );
}
