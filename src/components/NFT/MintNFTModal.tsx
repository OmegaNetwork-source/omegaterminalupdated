/**
 * MintNFTModal Component
 *
 * Provides UI for minting NFTs on Omega Network with image upload,
 * metadata input, and trait management.
 * Matches omega-nft-onchain.js UI with dark gradient background.
 */

"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import styles from "./MintNFTModal.module.css";
import { NFTMetadata, NFTTrait } from "@/types/nft";

interface MintNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMint: (imageFile: File, metadata: NFTMetadata) => Promise<void>;
}

/**
 * MintNFTModal - Modal for NFT minting with image upload and metadata
 */
export function MintNFTModal({ isOpen, onClose, onMint }: MintNFTModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showTraits, setShowTraits] = useState(false);
  const [traits, setTraits] = useState<NFTTrait[]>([]);
  const [isMinting, setIsMinting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    // Validate file is image type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setImageFile(file);
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle paste from clipboard
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
          }
          break;
        }
      }
    },
    [handleFileSelect]
  );

  // Add paste event listener when modal is open
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("paste", handlePaste);
      return () => {
        document.removeEventListener("paste", handlePaste);
      };
    }
  }, [isOpen, handlePaste]);

  // Handle add trait
  const handleAddTrait = () => {
    setTraits([...traits, { trait_type: "", value: "" }]);
  };

  // Handle remove trait
  const handleRemoveTrait = (index: number) => {
    setTraits(traits.filter((_, i) => i !== index));
  };

  // Handle trait change
  const handleTraitChange = (
    index: number,
    field: "trait_type" | "value",
    value: string
  ) => {
    const newTraits = [...traits];
    newTraits[index][field] = value;
    setTraits(newTraits);
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle mint
  const handleMint = async () => {
    // Validate
    if (!imageFile) {
      alert("Please select an image");
      return;
    }
    if (!name) {
      alert("Please enter a name for your NFT");
      return;
    }

    setIsMinting(true);

    try {
      // Create metadata
      const metadata: NFTMetadata = {
        name,
        description: description || undefined,
        image: "", // Will be set by IPFS upload
        attributes: traits.filter((t) => t.trait_type && t.value),
      };

      // Call onMint prop
      await onMint(imageFile, metadata);

      // Reset form
      handleRemoveImage();
      setName("");
      setDescription("");
      setTraits([]);
      setShowTraits(false);

      onClose();
    } catch (error) {
      console.error("Minting error:", error);
      alert(error instanceof Error ? error.message : "Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>🎨 Mint NFT</div>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Upload Zone */}
        <div
          className={styles.uploadZone}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: "2em", marginBottom: "10px" }}>📁</div>
          <div style={{ marginBottom: "5px" }}>
            Click to browse or paste image (Ctrl+V / Cmd+V)
          </div>
          <div style={{ fontSize: "0.8em", opacity: 0.7 }}>
            Supports: JPG, PNG, GIF, WEBP
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileInputChange}
          />
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className={styles.previewSection}>
            <img
              src={imagePreview}
              alt="Preview"
              className={styles.previewImage}
            />
            <button className={styles.removeButton} onClick={handleRemoveImage}>
              Remove Image
            </button>
          </div>
        )}

        {/* Form */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Name *</label>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome NFT"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description for your NFT"
            rows={3}
          />
        </div>

        {/* Traits Toggle */}
        <div className={styles.formGroup}>
          <label
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={showTraits}
              onChange={(e) => setShowTraits(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            <span className={styles.label} style={{ marginBottom: 0 }}>
              Add Traits/Attributes
            </span>
          </label>
        </div>

        {/* Traits Section */}
        {showTraits && (
          <div className={styles.traitsSection}>
            {traits.map((trait, index) => (
              <div key={index} className={styles.traitRow}>
                <input
                  type="text"
                  className={styles.input}
                  value={trait.trait_type}
                  onChange={(e) =>
                    handleTraitChange(index, "trait_type", e.target.value)
                  }
                  placeholder="Trait Type (e.g., Background)"
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  className={styles.input}
                  value={trait.value}
                  onChange={(e) =>
                    handleTraitChange(index, "value", e.target.value)
                  }
                  placeholder="Value (e.g., Blue)"
                  style={{ flex: 1 }}
                />
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveTrait(index)}
                  style={{ width: "auto", padding: "8px 12px" }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className={styles.button}
              onClick={handleAddTrait}
              style={{ width: "100%", marginTop: "8px" }}
            >
              + Add Trait
            </button>
          </div>
        )}

        {/* Mint Button */}
        <button
          className={styles.mintButton}
          onClick={handleMint}
          disabled={isMinting || !imageFile || !name}
        >
          {isMinting ? "⏳ Minting..." : "✨ Mint NFT"}
        </button>
      </div>
    </div>
  );
}
