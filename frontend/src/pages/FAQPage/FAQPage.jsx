import React, { useState } from 'react';
import styles from './FAQPage.module.css';
import { ChevronRight } from 'lucide-react';
import FeedbackForm from '../../components/FeedbackForm/FeedbackForm';

const faqData = [
   {
      id: 1,
      question: "Какую страну считают родиной розы?",
      answer: "Роза — собирательное название видов и сортов представителей рода Шиповник (лат. Rosa), выращиваемых человеком. Большая часть сортов роз получена в результате длительной селекции путём многократных повторных скрещиваний и отбора."
   },
   {
      id: 2,
      question: "Какой цветок называют божественным цветком, «цветком Зевса»?",
      answer: "Божественным цветком или цветком Зевса называют Гвоздику (лат. Diánthus). Название происходит от греческих слов 'Di' — Зевс и 'anthos' — цветок."
   },
   {
      id: 3,
      question: "Какое символическое значение розы?",
      answer: "Красные розы — символ любви и страсти. Белые — чистоты и невинности. Розовые розы символизируют элегантность и изысканность, а желтые — радость и дружбу."
   },
   {
      id: 4,
      question: "Актуальны ли цены и наличие на вашем сайте?",
      answer: "Да, информация на сайте обновляется в режиме реального времени. Если товар доступен для заказа, значит он есть в наличии по указанной цене."
   },
   {
      id: 5,
      question: "Вы отправляете товары наложенным платежом?",
      answer: "Мы работаем по системе предоплаты для обеспечения свежести цветов и гарантии доставки. Способы оплаты можно выбрать при оформлении заказа."
   },
   {
      id: 6,
      question: "Где гарантия того, что вы не мошенники, и если я внесу предоплату, то затем получу оплаченный товар?",
      answer: "Мы работаем официально, у нас есть физический адрес магазина во Владивостоке и сотни отзывов довольных клиентов. Вы также получаете электронный чек после оплаты."
   },
   {
      id: 7,
      question: "Я оплатил заказ переводом денег на банковскую карту, что дальше?",
      answer: "После подтверждения оплаты ваш заказ переходит в статус 'Оплачен'. Наш менеджер свяжется с вами для уточнения деталей, и флористы приступят к сборке букета к назначенной дате."
   },
   {
      id: 8,
      question: "Вы работаете с оптовыми покупателями? Какие условия/скидки?",
      answer: "Да, мы сотрудничаем с корпоративными клиентами. При заказе больших партий действуют специальные скидки. Для уточнения условий свяжитесь с нами через форму обратной связи."
   }
];

const FAQPage = () => {
   // Храним ID открытого вопроса. Если null — все закрыты.
   const [openId, setOpenId] = useState(1);

   const toggleItem = (id) => {
      setOpenId(openId === id ? null : id);
   };

   return (
      <div className={`container ${styles.faqContainer}`}>
         <nav className={styles.breadCrumb}>Главная {'>'} Вопрос ответ</nav>
         <h1 className={styles.mainTitle}>ОТВЕТЫ НА ПОПУЛЯРНЫЕ ВОПРОСЫ</h1>

         <div className={styles.faqList}>
            {faqData.map((item) => (
               <div
                  key={item.id}
                  className={`${styles.faqItem} ${openId === item.id ? styles.active : ''}`}
               >
                  <div className={styles.questionRow} onClick={() => toggleItem(item.id)}>
                     <h3 className={styles.questionText}>{item.question}</h3>
                     <div className={styles.iconWrapper}>
                        <ChevronRight size={20} className={styles.icon} />
                     </div>
                  </div>
                  <div className={styles.answerWrapper}>
                     <div className={styles.answerContent}>
                        <p>{item.answer}</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         <FeedbackForm/>
      </div>
   );
};

export default FAQPage;