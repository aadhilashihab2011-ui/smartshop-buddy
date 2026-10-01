import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Coins,
} from 'lucide-react';
import {
  AppView,
  ShoppingTripRecord,
  formatQuantity,
  getItemIcon,
} from '../types.ts';

interface HistoryViewProps {
  history: ShoppingTripRecord[];
  onApplyKitchenUpdates: (tripId: string, clearBought: boolean) => Promise<ShoppingTripRecord>;
  onNavigate: (view: AppView) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onApplyKitchenUpdates,
  onNavigate,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(history[0]?.id || null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateKitchen = async (tripId: string) => {
    setUpdatingId(tripId);
    try {
      await onApplyKitchenUpdates(tripId, false);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E0D5] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2D5A3D]">
            Saved Account Trip Archive
          </p>
          <h1 className="text-3xl font-bold text-[#1C2820] font-display">
            Shopping History
          </h1>
          <p className="text-sm text-[#546358] max-w-2xl">
            Review your past shopping trips, planned vs. purchased items, items left, Kids&apos; Choice Tokens used, and reusable cloth bag habits. Starting a new trip never deletes your previous records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('shopping-list')}
          className="px-5 py-2.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 self-start lg:self-auto cursor-pointer whitespace-nowrap"
        >
          <span>Plan New Trip</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E0D5] p-12 text-center space-y-4">
          <Calendar className="w-8 h-8 text-[#546358] mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#1C2820]">No shopping trips recorded yet</h2>
            <p className="text-xs text-[#546358] max-w-md mx-auto">
              Once you complete a trip in Shopping Mode, your summary and item breakdown will appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('shopping-mode')}
            className="px-5 py-2.5 bg-[#2D5A3D] text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Go to Shopping Mode
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {history.map((trip) => {
            const isExpanded = expandedId === trip.id;
            const unpurchasedItems = trip.unpurchasedItems || [];
            const dateFormatted = new Date(trip.completedAt).toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={trip.id}
                className="bg-white rounded-2xl border border-[#E5E0D5] p-6 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFECE6] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#546358] font-mono tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-[#2D5A3D]" />
                      <span>{dateFormatted}</span>
                    </div>
                    <h2 className="text-lg font-bold text-[#1C2820]">
                      Completed Shopping Trip
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-[#2D5A3D] flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>
                        Reusable bag: {trip.reusableBagUsed ? 'Yes, brought it' : 'Not used'}
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : trip.id)}
                      className="px-3 py-1.5 text-xs font-medium text-[#1C2820] bg-[#FBF9F5] hover:bg-[#F3EFE6] border border-[#D8D2C5] rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Details'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Required Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
                    <p className="text-xs text-[#546358]">Planned items</p>
                    <p className="text-xl font-bold text-[#1C2820] font-mono tabular-nums mt-0.5">
                      {trip.itemsPlanned}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
                    <p className="text-xs text-[#546358]">Purchased items</p>
                    <p className="text-xl font-bold text-[#2D5A3D] font-mono tabular-nums mt-0.5">
                      {trip.itemsBought}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
                    <p className="text-xs text-[#546358]">Items left</p>
                    <p className="text-xl font-bold text-[#1C2820] font-mono tabular-nums mt-0.5">
                      {trip.itemsRemaining}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
                    <p className="text-xs text-[#546358]">Kids&apos; tokens used</p>
                    <p className="text-xl font-bold text-[#1C2820] font-mono tabular-nums mt-0.5">
                      {trip.tokensUsed} / 3
                    </p>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-[#FBF9F5] border border-[#E5E0D5]">
                    <p className="text-xs text-[#546358]">Reusable bag</p>
                    <p className="text-sm font-bold text-[#2D5A3D] mt-1">
                      {trip.reusableBagUsed ? 'Yes, brought it' : 'Not used'}
                    </p>
                  </div>
                </div>

                {/* Display Kids' Choice Token Selections for the Trip */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#1C2820] bg-[#FBF9F5] px-4 py-2.5 rounded-xl border border-[#E5E0D5]">
                  <Coins className="w-4 h-4 text-[#2D5A3D]" />
                  <span className="font-semibold">Items selected using tokens:</span>
                  <span>
                    {trip.tokenChoices && trip.tokenChoices.length > 0
                      ? trip.tokenChoices
                          .map((choice, idx) => `Token ${idx + 1} → ${choice}`)
                          .join(' · ')
                      : 'None'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#3C5243] bg-[#F1F6F2] border border-[#C5DBC9] rounded-xl p-3.5">
                  {trip.summaryMessage}
                </p>

                {isExpanded && (
                  <div className="pt-3 border-t border-[#EFECE6] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#546358]">
                        Purchased Items &amp; My Kitchen Update
                      </h3>

                      {trip.kitchenUpdated ? (
                        <span className="text-xs font-semibold text-[#2D5A3D] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>My Kitchen Updated</span>
                        </span>
                      ) : (
                        trip.boughtItemsDetail.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleUpdateKitchen(trip.id)}
                            disabled={updatingId === trip.id}
                            className="px-3.5 py-1.5 bg-[#2D5A3D] hover:bg-[#234730] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>
                              {updatingId === trip.id
                                ? 'Updating...'
                                : 'Update My Kitchen'}
                            </span>
                          </button>
                        )
                      )}
                    </div>

                    {trip.boughtItemsDetail.length === 0 ? (
                      <p className="text-xs text-[#546358]">No items were marked bought on this trip.</p>
                    ) : (
                      <div className="divide-y divide-[#EFECE6]">
                        {trip.boughtItemsDetail.map((item) => (
                          <div
                            key={item.shoppingItemId}
                            className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span>{getItemIcon(item.name, item.category)}</span>
                              <span className="font-semibold text-[#1C2820]">{item.name}</span>
                              <span className="text-[#546358]"> · {item.category}</span>
                            </div>
                            <div className="font-mono tabular-nums text-[#546358]">
                              Before: {formatQuantity(item.beforeQuantity, item.unit)} → Bought: +
                              {formatQuantity(item.quantityBought, item.unit)} →{' '}
                              <strong className="text-[#2D5A3D]">
                                After: {formatQuantity(item.afterQuantity, item.unit)}
                              </strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Unpurchased Items ("Items left") */}
                    {unpurchasedItems.length > 0 && (
                      <div className="pt-3 border-t border-[#EFECE6] space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#546358]">
                          Items Left ({unpurchasedItems.length} kept for future trip)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {unpurchasedItems.map((uItem) => (
                            <span
                              key={uItem.id}
                              className="px-3 py-1.5 rounded-lg bg-[#FBF9F5] border border-[#E5E0D5] text-xs text-[#1C2820]"
                            >
                              {getItemIcon(uItem.name, uItem.category)} {uItem.name} —{' '}
                              <span className="font-mono tabular-nums text-[#546358]">
                                {formatQuantity(uItem.quantity, uItem.unit)}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
