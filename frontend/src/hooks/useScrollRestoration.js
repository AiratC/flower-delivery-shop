import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const useScrollRestoration = (isLoading) => {
   const { pathname } = useLocation();

   useEffect(() => {
      // Сохранение позиции (оставляем как было)
      const handleScroll = () => {
         window.history.replaceState(
            { ...window.history.state, scrollPosition: window.scrollY },
            "",
         );
      };
      window.addEventListener("scroll", handleScroll);

      // Восстановление позиции: срабатывает ТОЛЬКО когда isLoading стал false
      if (!isLoading) {
         const savedPosition = window.history.state?.scrollPosition;
         if (savedPosition) {
            // Используем setTimeout 0 или requestAnimationFrame,
            // чтобы дать React завершить цикл отрисовки DOM
            setTimeout(() => {
               window.scrollTo({
                  top: savedPosition,
                  behavior: "instant",
               });
            }, 100); // Небольшая задержка помогает при восстановлении длинных списков
         }
      }

      return () => window.removeEventListener("scroll", handleScroll);
   }, [pathname, isLoading]); // Добавляем isLoading в зависимости
};

export default useScrollRestoration;
