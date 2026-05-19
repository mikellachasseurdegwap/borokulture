"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User, Loader2, MapPin, Calendar, Sparkles } from "lucide-react";
import api, { type ApiError } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

type SearchUser = {
  id: string;
  username: string;
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  createdAt: string;
};

type SearchResponse = {
  users: SearchUser[];
};

interface UserSearchProps {
  className?: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Get initials from username
const getInitials = (username?: string) => {
  return (username || "U").slice(0, 2).toUpperCase();
};

// Format date
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(dateString));
};

export function UserSearch({ className = "" }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedQuery.trim() || !isAuthenticated()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data } = await api.get<SearchResponse>("/search/users", {
          params: { q: debouncedQuery.trim() }
        });

        setResults(data.users || []);
        setHasSearched(true);
      } catch (requestError) {
        const apiError = requestError as ApiError;
        setError(apiError.message || "Erreur de recherche");
        setResults([]);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setError(null);
  }, []);

  // Close dropdown
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Container */}
      <div className="relative">
        {/* Glow effect on focus */}
        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#FF6B00] via-[#FF3D5A] to-[#FF4D8D] opacity-0 transition-opacity duration-300 focus-within:opacity-100 blur-md" />
        
        <div className="relative flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#121212]/80 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl focus-within:border-[#FF6B00]/60 focus-within:shadow-[0_0_0_4px_rgba(255,107,0,0.15),0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
          {/* Search Icon */}
          <Search className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
          
          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Rechercher des créateurs..."
            className="flex-1 bg-transparent text-sm font-medium text-white placeholder:text-[#6B7280] outline-none min-w-0"
            autoComplete="off"
            spellCheck={false}
          />
          
          {/* Loading spinner */}
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#FF6B00]" />
          ) : query ? (
            <button
              onClick={clearSearch}
              className="rounded-full p-1 text-[#6B7280] hover:bg-white/[0.08] hover:text-white transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/[0.12] bg-[#121212]/95 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center gap-3 px-4 py-8">
                <Loader2 className="h-5 w-5 animate-spin text-[#FF6B00]" />
                <span className="text-sm font-medium text-[#9CA3AF]">Recherche en cours...</span>
              </div>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <div className="px-4 py-6 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-sm font-semibold text-red-300">{error}</p>
              </div>
            )}

            {/* Empty State - No query */}
            {!isLoading && !error && !query && (
              <div className="px-4 py-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6B00]/10">
                  <Search className="h-6 w-6 text-[#FF6B00]" />
                </div>
                <p className="text-sm font-semibold text-white">Rechercher des créateurs</p>
                <p className="mt-1 text-xs font-medium text-[#6B7280]">
                  Trouvez des utilisateurs par leur nom
                </p>
              </div>
            )}

            {/* No Results State */}
            {!isLoading && !error && query && hasSearched && results.length === 0 && (
              <div className="px-4 py-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">
                  <User className="h-6 w-6 text-[#6B7280]" />
                </div>
                <p className="text-sm font-semibold text-white">Aucun utilisateur trouvé</p>
                <p className="mt-1 text-xs font-medium text-[#6B7280]">
                  Essayez avec un autre pseudo
                </p>
              </div>
            )}

{/* Results List */}
            {!isLoading && !error && results.length > 0 && (
              <div className="max-h-[320px] overflow-y-auto py-2">
                {results.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Link
                      href={`/profile/${user.username}`}
                      onClick={closeDropdown}
                      className="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-[#FF6B00]/12 hover:to-transparent hover:shadow-[0_0_24px_rgba(255,107,0,0.08)] group"
                    >
                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FF6B00]/30 bg-[#FF6B00]/12 text-xs font-black text-[#FF8A1F] shadow-[0_0_16px_rgba(255,107,0,0.1)] group-hover:border-[#FF6B00]/50 group-hover:shadow-[0_0_24px_rgba(255,107,0,0.2)] transition-all">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          getInitials(user.displayName || user.username)
                        )}
                      </div>

                      {/* User Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate text-sm font-bold text-white group-hover:text-[#FF8A1F] transition-colors">
                          <span className="truncate">@{user.username}</span>
                          {user.isVerified && (
                            <span className="flex shrink-0">
                              <Sparkles className="h-3.5 w-3.5 text-[#3B82F6]" fill="#3B82F6" />
                            </span>
                          )}
                        </div>
                        {user.displayName && (
                          <div className="truncate text-xs font-medium text-[#9CA3AF]">
                            {user.displayName}
                          </div>
                        )}
                        {user.bio && (
                          <div className="truncate text-xs text-[#6B7280] mt-0.5">
                            {user.bio.length > 50 ? user.bio.slice(0, 50) + '...' : user.bio}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <Sparkles className="h-4 w-4 shrink-0 text-[#6B7280] group-hover:text-[#FF6B00] transition-colors" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
