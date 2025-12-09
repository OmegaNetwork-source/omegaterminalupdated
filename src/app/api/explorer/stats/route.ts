/**
 * Omega Network Explorer Stats API Route
 * Server-side proxy for Omega Network Explorer stats service
 * Fetches total transactions and total wallets from explorer.omeganetwork.co
 */

import { NextRequest, NextResponse } from "next/server";

const EXPLORER_STATS_BASE_URL = "https://explorer.omeganetwork.co/stats-service/api/v1/pages";

export async function GET(request: NextRequest) {
  try {
    // Fetch main page (contains both total_addresses and potentially total_transactions)
    // Endpoint: /stats-service/api/v1/pages/main
    const mainResponse = await fetch(
      `${EXPLORER_STATS_BASE_URL}/main`,
      {
        cache: "no-store", // Don't cache to get fresh data
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!mainResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch explorer stats",
          totalTransactions: null,
          totalWallets: null,
        },
        { status: 500 }
      );
    }

    const mainData = await mainResponse.json();

    console.log("[Explorer Stats API] Main page response:", mainData);

    // Parse total transactions from main page response
    // Look for total_transactions, totalTransactions, or similar field
    let totalTransactions: number | null = null;
    if (mainData && typeof mainData === "object") {
      // Check for common field names
      const possibleFieldNames = [
        "total_transactions",
        "totalTransactions",
        "total_transactions_count",
        "totalTransactionsCount",
      ];

      for (const fieldName of possibleFieldNames) {
        if (mainData[fieldName] && typeof mainData[fieldName] === "object") {
          const item = mainData[fieldName];
          if (item.value !== undefined && item.value !== null) {
            const value = item.value;
            totalTransactions =
              typeof value === "string"
                ? parseInt(value, 10)
                : typeof value === "number"
                ? value
                : null;
            if (totalTransactions !== null && !isNaN(totalTransactions)) {
              break;
            }
          }
        }
      }

      // If not found, search through all fields for transaction-related data
      if (totalTransactions === null) {
        for (const key in mainData) {
          const item = mainData[key];
          if (item && typeof item === "object" && item.id) {
            const id = item.id.toLowerCase();
            if (
              (id.includes("total") && id.includes("transaction")) ||
              id === "totaltxns" ||
              id === "total_txns"
            ) {
              if (item.value !== undefined && item.value !== null) {
                const value = item.value;
                totalTransactions =
                  typeof value === "string"
                    ? parseInt(value, 10)
                    : typeof value === "number"
                    ? value
                    : null;
                if (totalTransactions !== null && !isNaN(totalTransactions)) {
                  break;
                }
              }
            }
          }
        }
      }
    }

    // Parse total addresses from main page response
    // Format: { total_addresses: { id: "totalAddresses", value: "217802", ... } }
    let totalWallets: number | null = null;
    if (
      mainData &&
      typeof mainData === "object" &&
      mainData.total_addresses
    ) {
      const totalAddresses = mainData.total_addresses;
      if (totalAddresses && totalAddresses.value !== undefined) {
        const value = totalAddresses.value;
        totalWallets =
          typeof value === "string"
            ? parseInt(value, 10)
            : typeof value === "number"
            ? value
            : null;
      }
    }

    return NextResponse.json({
      success: true,
      totalTransactions,
      totalWallets,
    });
  } catch (error) {
    console.error("[Explorer Stats API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch explorer stats",
        totalTransactions: null,
        totalWallets: null,
      },
      { status: 500 }
    );
  }
}

