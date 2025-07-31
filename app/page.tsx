"use client";
import { DatePickerButton } from "@/components/date-picker-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Circle, Plus } from "lucide-react";
import * as chrono from "chrono-node";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Home() {
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [dateMatch, setDateMatch] = useState<{
    index: number;
    text: string;
  } | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const lastDetectedDate = useRef<number | null>(null);

  const isManualDateUpdate = useRef<boolean>(false);

  // Fonction pour formater une date en texte naturel français
  function formatDateToNaturalText(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const targetDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (targetDate.getTime() === today.getTime()) {
      return "aujourd'hui";
    } else if (targetDate.getTime() === tomorrow.getTime()) {
      return "demain";
    } else {
      return format(date, "EEEE d MMMM", { locale: fr });
    }
  }

  // Fonction pour remplacer ou ajouter une date dans le texte
  function updateTaskWithDate(
    currentTask: string,
    newDate: Date | null
  ): string {
    if (!newDate) {
      // Supprimer la date existante si aucune nouvelle date
      if (dateMatch) {
        return (
          currentTask.slice(0, dateMatch.index) +
          currentTask.slice(dateMatch.index + dateMatch.text.length)
        );
      }
      return currentTask;
    }

    const dateText = formatDateToNaturalText(newDate);

    if (dateMatch) {
      // Remplacer la date existante
      return (
        currentTask.slice(0, dateMatch.index) +
        dateText +
        currentTask.slice(dateMatch.index + dateMatch.text.length)
      );
    } else {
      // Ajouter la date à la fin
      return currentTask.trim() + (currentTask.trim() ? " " : "") + dateText;
    }
  }

  // Détection de date à chaque changement de task
  useEffect(() => {
    // Éviter la boucle infinie lors des mises à jour manuelles
    if (isManualDateUpdate.current) {
      isManualDateUpdate.current = false;
      return;
    }

    const results = chrono.fr.parse(task, new Date(), { forwardDate: true });
    if (results.length > 0) {
      const { index, text: dateText, start } = results[0];
      const newDate = start.date();
      const newDateTime = newDate.getTime();

      // Animation seulement si nouvelle date détectée
      if (lastDetectedDate.current !== newDateTime) {
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 600);
        lastDetectedDate.current = newDateTime;
      }

      setDueDate(newDate);
      setDateMatch({ index, text: dateText });
    } else {
      setDueDate(null);
      setDateMatch(null);
      lastDetectedDate.current = null;
    }
  }, [task]);

  // Gestionnaire pour les changements de date du DatePicker
  const handleDateChange = (newDate: Date | undefined) => {
    const selectedDate = newDate || null;

    // Marquer comme mise à jour manuelle pour éviter les conflits
    isManualDateUpdate.current = true;

    // Mettre à jour le texte avec la nouvelle date
    const updatedTask = updateTaskWithDate(task, selectedDate);
    setTask(updatedTask);

    // Mettre à jour l'état de la date
    setDueDate(selectedDate);

    // Mettre à jour dateMatch pour le highlight
    if (selectedDate) {
      const dateText = formatDateToNaturalText(selectedDate);
      const index = updatedTask.lastIndexOf(dateText);
      setDateMatch({ index, text: dateText });

      // Animation pour la nouvelle date
      setShowAnimation(true);
      setTimeout(() => setShowAnimation(false), 600);
    } else {
      setDateMatch(null);
    }
  };

  // Surlignage visuel avec animation
  function highlightDate(text: string) {
    if (dateMatch) {
      return (
        <>
          {text.slice(0, dateMatch.index)}
          <motion.span
            initial={{ backgroundColor: "#e0e7ff", scale: 1.1, opacity: 0.8 }}
            animate={{
              backgroundColor: "#e0e7ff90",
              scale: 1,
              opacity: 1,
            }}
            transition={{
              type: "spring", // effet élastique
              damping: 15, // Contrôle le rebond (plus bas = plus de rebond)
              stiffness: 300, // Contrôle la vitesse (plus haut = plus rapide)
              mass: 0.8, // Contrôle l'inertie
            }}
            style={{
              color: "#3730a3",
              borderRadius: 4,
              padding: "0 0px",
              display: "inline-block",
            }}
          >
            {dateMatch.text}
          </motion.span>
          {text.slice(dateMatch.index + dateMatch.text.length)}
        </>
      );
    }
    return text;
  }

  return (
    <div className="font-sans flex flex-col items-center justify-center min-h-screen p-8 pb-20 sm:p-20 gap-4">
      <form
        action=""
        className="w-full max-w-4xl rounded-3xl bg-white p-4 shadow-lg flex items-start gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          // Logique pour soumettre la tâche
          console.log("Tâche soumise:", task, "Date d'échéance:", dueDate);
          setTask("");
          setDueDate(null);
          setDateMatch(null); // Réinitialiser dateMatch
        }}
      >
        <Checkbox
          disabled={true}
          className="w-8 h-8 rounded-md bg-gray-200 cursor-pointer data-[state=checked]:bg-blue-500 data-[state=checked]:border-none appearance-none flex items-center justify-center data-[state=checked]:after:content-['✓'] data-[state=checked]:after:text-white data-[state=checked]:after:text-sm data-[state=checked]:after:font-bold disabled:cursor-default"
        />
        <div className="relative w-full">
          <textarea
            name="task"
            value={task} // Ajoute cette ligne pour lier la valeur
            id=""
            placeholder="Add a new task"
            className="w-full h-8 outline-none font-medium text-transparent placeholder:text-gray-400 text-xl border-none resize-none bg-transparent overflow-hidden"
            style={{ height: "32px", caretColor: "#374151" }}
            onChange={(e) => setTask(e.target.value)}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "32px";
              target.style.height = Math.max(target.scrollHeight, 32) + "px";

              // Synchroniser la hauteur de l'overlay
              const overlay = target.parentElement?.querySelector(
                ".text-overlay"
              ) as HTMLElement;
              if (overlay) {
                overlay.style.height = target.style.height;
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const form = (e.target as HTMLTextAreaElement).form;
                if (form) form.requestSubmit();
              }
            }}
          />
          <div
            className="text-overlay text-gray-800 pointer-events-none w-full absolute top-0 left-0 z-0 font-medium text-xl"
            style={{
              height: "32px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              padding: "0",
              lineHeight: "inherit",
              // color: "#1e2939", // Rend le texte invisible sauf les spans colorés
            }}
            aria-hidden
          >
            {highlightDate(task)}
          </div>
        </div>
        <DatePickerButton
          date={dueDate}
          // onDateChange={(newDate) => {
          //   setDueDate(newDate || null);
          // }}
          onDateChange={handleDateChange} // Utilise handleDateChange au lieu de la fonction simple
        />
        <Select>
          <SelectTrigger className="w-[180px] bg-gray-200/50 font-bold border-none outline-none ring-none">
            <Circle className="size-4" />
            <SelectValue placeholder="No List" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          type="submit"
          className="bg-gray-200/50 font-bold border-none outline-none ring-none rounded-full size-8 cursor-pointer"
        >
          <Plus />
        </Button>
      </form>
    </div>
  );
}
