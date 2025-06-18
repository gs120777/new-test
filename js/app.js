const selectOne = (selector) => document.querySelector(selector);
const selectAll = (selector) => document.querySelectorAll(selector);

const on = (element, eventName, selector, eventHandler, noSelector) => {
  if (!element) {
    return;
  }

  if (!eventHandler) {
    eventHandler = selector;
    noSelector = true;
  }
  if (selector && !noSelector) {
    const wrappedHandler = (e) => {
      if (!e.target) return;
      const el = e.target.closest(selector);
      if (el) {
        eventHandler.call(el, e);
      }
    };
    element.addEventListener(eventName, wrappedHandler);
    return wrappedHandler;
  }

  const wrappedHandler = (e) => {
    eventHandler.call(element, e);
  };
  element.addEventListener(eventName, wrappedHandler);
  return wrappedHandler;
};

const fadeIn = (element, fn) => {
  element.addEventListener(
    "animationend",
    (event) => {
      fn && fn(event.target);
    },
    { once: true },
  );
  element.style.opacity = 0;
  element.classList.remove("is-hidden");
  element.classList.add(
    "animate__animated",
    "animate__faster",
    "animate__fadeIn",
  );
  return element;
};

const fadeOut = (element, fn) => {
  element.addEventListener(
    "animationend",
    (event) => {
      fn && fn(event.target);
    },
    { once: true },
  );
  element.classList.add(
    "animate__animated",
    "animate__faster",
    "animate__fadeOut",
  );
  return element;
};

const hideSections = () => {
  selectAll("section").forEach((section) => section.classList.add("is-hidden"));
};

const showLoadingSection = () => {
  const ms = 1000;
  hideSections();
  fadeIn(selectOne("#loading"));

  const steps = [1, 2, 3];

  steps.map((n, i) => {
    setTimeout(() => fadeIn(selectOne(`#loading-${n}-step`)), i * ms);
  });

  return setTimeout(() => {
    if (selectOne("#game")) {
      showGameSection();
    } else {
      showPrefillOrRedirect();
    }
  }, steps.length * ms);
};

const showGameSection = () => {
  hideSections();
  fadeIn(selectOne("#game"), () => showWelcomeModal());
};

const showPrefillSection = () => {
  hideSections();
  fadeIn(selectOne("#prefill"));
};

const questionOnClick = (e) => {
  fadeOut(e.target.closest(".question"), (element) => {
    element.classList.add("is-hidden");
    const next = element.nextElementSibling;
    if (next && next.classList.contains("question")) {
      const next = element.nextElementSibling;
      fadeIn(next, () => {});
    } else {
      hideQuestions();
    }
  });
};

let isWin = false;
const boxOnClick = (e) => {
  const boxBlock = e.target.closest(".game-box");

  if (boxBlock.classList.contains("is-disabled")) {
    return;
  }

  boxBlock.classList.add("is-disabled");

  if (isWin) {
    selectAll(".game-box").forEach((c) => c.classList.add("is-disabled"));
    boxBlock.classList.add("is-box-opened", "is-box-won");
    setTimeout(showWinModal, 2000);
  } else {
    isWin = true;
    boxBlock.classList.add("is-box-opened");
    setTimeout(showTryAgainModal, 2000);
  }
};

const init = (fn) => {
  if (document.readyState !== "loading") {
    return fn();
  }

  document.addEventListener("DOMContentLoaded", fn, { once: true });
};

const initRedirectURL = () => {
  const redirectURL = selectOne("#redirect-url").getAttribute("href");
  if (redirectURL === "{offer}") {
    return redirectURL;
  }

  try {
    if (redirectURL.startsWith("http")) {
      return new URL(redirectURL);
    }

    if (redirectURL.startsWith("/")) {
      return new URL(redirectURL, window.location.origin);
    }
  } catch {}

  return redirectURL;
};

const initSlider = () => {
  const count = +selectOne("#slider-count").value;
  if (!count) {
    return;
  }
  const microSwiper = new Swiper("#micro-swiper", {
    spaceBetween: 3,
    slidesPerView: Math.min(count, 4),
    freeMode: true,
    watchSlidesProgress: true,
  });

  new Swiper("#big-swiper", {
    direction: "horizontal",
    autoplay: Boolean(selectOne("#slider-autoplay").value),
    loop: true,
    pagination: {
      enabled: true,
      el: ".swiper-pagination",
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    scrollbar: {
      el: ".swiper-scrollbar",
    },
    thumbs: {
      swiper: microSwiper,
    },
  });

  const pagination = selectOne("#swiper-pagination");
  pagination
    .querySelectorAll(".swiper-pagination-bullet")
    .forEach((element) => {
      element.style.backgroundColor = pagination.style.color;
    });

  selectAll("#micro-swiper img").forEach((element) => {
    on(element, "mouseenter", (e) => {
      e.target.style.border = e.target.getAttribute("data-enter");
    });
    on(element, "mouseleave", (e) => {
      e.target.style.border = e.target.getAttribute("data-leave");
    });
  });
};

const initCountDown = () => {
  const container = selectOne("#countdown-container");
  if (!container) {
    return;
  }

  const countDownElement = selectOne("#countdown-value");
  const countDownTimeTime = countDownElement.getAttribute("data-time");
  const timeSplit = countDownTimeTime.split(":");

  const seconds = +timeSplit[0] * 3600 + +timeSplit[1] * 60 + +timeSplit[2];

  const countdownTo = new Date(new Date().getTime() + seconds * 1000);
  const countdownTime = countdownTo.getTime();

  countdown(countdownTime, (ts) => {
    if (ts.value < 0 && (ts.minutes || ts.seconds)) {
      countDownElement.textContent = [
        String(ts.hours).padStart(2, "0"),
        String(ts.minutes).padStart(2, "0"),
        String(ts.seconds).padStart(2, "0"),
      ].join(":");
    }
  });
};

const fireModal = (template, options = {}) => {
  const confirmButtonFontColor = selectOne("#modal-buttons-font-color").value;
  const confirmButtonBackgroundColor = selectOne(
    "#modal-buttons-background-color",
  ).value;
  return Swal.fire(
    Object.assign(
      {},
      {
        html: selectOne(template).innerHTML,
        confirmButtonColor: confirmButtonBackgroundColor,
        confirmButtonText: `<span style="color: ${confirmButtonFontColor}">OK</span>`,
        allowOutsideClick: false,
        allowEscapeKey: false,
        heightAuto: false,
      },
      options,
    ),
  );
};

const showWelcomeModal = () => {
  return fireModal("#modal-welcome");
};

const showTryAgainModal = () => {
  return fireModal("#modal-try-again");
};

const showFaqModal = () => {
  return fireModal("#modal-faq");
};

const showPrefillOrRedirect = () => {
  const prefill = selectOne("#prefill");

  if (!prefill) {
    const url = initRedirectURL();
    if (typeof url === "string") {
      window.location.replace(decodeURIComponent(url));
    }
    if (url instanceof URL) {
      window.location.replace(decodeURIComponent(url.toString()));
    }
    return;
  }

  showPrefillSection();
};

const showWinModal = async () => {
  return fireModal("#modal-win").then(() => {
    fadeOut(selectOne("#game"));
    showPrefillOrRedirect();
  });
};

const initQuestions = () => {
  on(selectOne("#questions"), "click", "button", questionOnClick);
};

const hideQuestions = () => {
  fadeOut(selectOne("#questions"));

  if (selectOne("#eligibility")) {
    fadeIn(selectOne("#eligibility"));
  } else {
    showLoadingSection();
  }
};

const initEligibility = () => {
  const eligibility = selectOne("#eligibility");
  if (!eligibility) {
    return;
  }

  on(eligibility, "click", ".input", (e) => {
    e.target && e.target.classList.remove("is-danger");
  });

  on(eligibility, "click", "button", (e) => {
    e.preventDefault();

    const inputs = eligibility.querySelectorAll("input");
    for (const input of inputs) {
      if (!input.value) {
        input.classList.add("is-danger");
        return;
      }
    }

    showLoadingSection();
  });
};

const toggleFaq = (el) => {
  let activeAnswer = document.querySelector(".faq-answer.faq-active");
  let activeArrow = document.querySelector(
    ".faq-question .faq-arrow.faq-rotate",
  );

  if (activeAnswer && activeAnswer !== el.nextElementSibling) {
    activeAnswer.style.display = "none";
    activeAnswer.classList.remove("faq-active");
  }

  if (activeArrow && activeArrow !== el.querySelector(".faq-arrow")) {
    activeArrow.classList.remove("faq-rotate");
  }

  let answer = el.nextElementSibling;
  let arrow = el.querySelector(".faq-arrow");

  if (answer.style.display === "block") {
    answer.style.display = "none";
    answer.classList.remove("faq-active");
    arrow.classList.remove("faq-rotate");
  } else {
    answer.style.display = "block";
    answer.classList.add("faq-active");
    arrow.classList.add("faq-rotate");
  }
};

const initFaq = () => {
  if (!selectOne("#faq")) {
    return;
  }

  on(selectOne("#faq"), "click", "#show-faq", () => {
    showFaqModal();
  });

  on(selectOne("body"), "click", ".faq-question", (e) => {
    toggleFaq(e.target);
  });
};

const initBoxes = () => {
  on(selectOne("#game"), "click", ".game-box", boxOnClick);
};

const initWheel = () => {
  const wheel = selectOne("#wheel");
  if (!wheel) {
    return;
  }

  class Wheel {
    constructor(callbacks, seconds) {
      this.callbacks = callbacks;
      this.seconds = seconds;

      this.wheel = selectOne("#wheel");
      this.wheel.style.setProperty("--animation-duration", `${this.seconds}s`);
      this.currentRotation = 0;
      this.isSpinning = false;
      this.sectorAngle = 45;

      this.spinCount = 0;

      this.init();
    }

    init() {
      this.wheel.addEventListener("click", () => this.spin());
    }

    spin() {
      if (this.isSpinning || this.spinCount > 1) {
        return;
      }

      this.isSpinning = true;
      this.wheel.classList.add("spinning");

      this.spinCount++;

      let targetSector;
      if (this.spinCount === 1) {
        targetSector = 1;
      } else if (this.spinCount === 2) {
        targetSector = 0;
      }

      const targetAngle = this.calculateAngleForSector(targetSector);

      let relativeRotation = targetAngle - this.currentRotation;

      if (relativeRotation > 180) {
        relativeRotation -= 360;
      } else if (relativeRotation < -180) {
        relativeRotation += 360;
      }

      const totalRotation = relativeRotation + 4 * 360;
      const newTotalRotation = this.currentRotation + totalRotation;

      this.wheel.style.setProperty("--rotation", `${newTotalRotation}deg`);
      this.wheel.classList.add("wheel-spinning");

      setTimeout(() => {
        this.isSpinning = false;
        this.wheel.classList.remove("spinning", "wheel-spinning");
        this.currentRotation = newTotalRotation % 360;
        this.wheel.style.transform = `rotate(${-22.5 + this.currentRotation}deg)`;

        if (this.spinCount === 1) {
          return this.runCallback();
        }

        const confetti = window.confetti;

        selectOne("#wheel-center-product").classList.add("show");
        confetti({
          particleCount: 100,
          spread: 70,
          origin: {
            y: this.wheel.getBoundingClientRect().bottom / window.innerHeight,
          },
        });

        setTimeout(
          () => {
            this.runCallback();
          },
          (this.seconds - 3) * 1000,
        );
      }, this.seconds * 1000);
    }

    calculateAngleForSector(targetSector) {
      const sectorCenter =
        targetSector * this.sectorAngle + this.sectorAngle / 2;
      return (360 - sectorCenter + this.sectorAngle / 2) % 360;
    }

    runCallback() {
      this.callbacks[this.spinCount - 1]();
    }
  }

  new Wheel([showTryAgainModal, showWinModal], 5);
};

const formatToday = (str) => {
  if (!str) {
    return "";
  }

  const padNumberStart = (num) => num.toString().padStart(2, "0");

  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  return str.replaceAll(
    /\{today:((dd|mm|yyyy)([.\- :])(dd|mm|yyyy)([.\- :])(dd|mm|yyyy))}/g,
    (match, format) =>
      format
        .replace("dd", padNumberStart(day))
        .replace("mm", padNumberStart(month))
        .replace("yyyy", year),
  );
};

const initTodayDates = (selector) => {
  selectAll(selector).forEach((element) => {
    element.innerHTML = formatToday(element.innerHTML);
  });
};

const showPopup = () => {
  const toast = selectOne("#toast");
  const popup = window.popups.shift();
  if (popup) {
    toast.querySelector("#toast-title").textContent = formatToday(popup.title);
    toast.querySelector("#toast-message").textContent = formatToday(
      popup.message,
    );
    toast.querySelector("#toast-note").textContent = formatToday(popup.note);
    toast.querySelector("#toast-image").classList.add("is-invisible");
    if (popup.image) {
      toast.querySelector("#toast-image").setAttribute("src", popup.image);
      toast.querySelector("#toast-image").classList.remove("is-hidden");
    } else {
      toast.querySelector("#toast-image").classList.add("is-hidden");
    }

    toast.classList.remove("is-hidden");
    toast.classList.remove("animate__fadeOut");

    const autocloseDelay = Number.parseInt(
      popupsTiming["popups-autoclose-delay"],
      10,
    );
    const nextDelay = Number.parseInt(
      popupsTiming["popups-show-next-delay"],
      10,
    );

    let toastTimeout;

    on(selectOne("#toast-close"), "click", () => {
      clearTimeout(toastTimeout);
      toast &&
        fadeOut(toast, () => {
          setTimeout(
            showPopup,
            (Number.isInteger(nextDelay) ? nextDelay : 10) * 1000,
          );
        });
    });

    toastTimeout = setTimeout(
      () => {
        toast &&
          fadeOut(toast, () => {
            setTimeout(
              showPopup,
              (Number.isInteger(nextDelay) ? nextDelay : 10) * 1000,
            );
          });
      },
      (Number.isInteger(autocloseDelay) ? autocloseDelay : 6) * 1000,
    );
  }
};

const initPopups = () => {
  const toast = selectOne("#toast");
  if (!toast) {
    return;
  }

  if (!Array.isArray(window.popups)) {
    return;
  }

  const firstDelay = Number.parseInt(popupsTiming["popups-first-delay"], 10);

  setTimeout(showPopup, (Number.isInteger(firstDelay) ? firstDelay : 0) * 1000);
};

const initPrefill = () => {
  selectAll(".prefill-form").forEach((form) => {
    const validator = new JustValidate(form, {
      errorFieldCssClass: ["is-danger"],
      successFieldCssClass: ["is-success"],
    });
    const fields = form.querySelectorAll("input");

    fields.forEach((field) => {
      const rules = [
        {
          rule: "required",
          errorMessage: field.getAttribute("data-error-required-message"),
        },
      ];

      if (field.getAttribute("type") === "email") {
        rules.push({
          rule: "email",
          errorMessage: field.getAttribute("data-error-email-message"),
        });
      }

      if (field.hasAttribute("data-phone-code")) {
        rules.push({
          rule: "minLength",
          value: 10,
          errorMessage: field.getAttribute("data-error-phone-message"),
        });
        rules.push({
          rule: "customRegexp",
          value: /^\+[1-9]\d{9,14}$/,
          errorMessage: field.getAttribute("data-error-phone-message"),
        });
      }

      validator.addField(field, rules);
    });

    form.querySelectorAll("[data-phone-code]").forEach((field) => {
      const code = field.getAttribute("data-phone-code") || "";
      new Maska.MaskInput(field, {
        mask: code.padEnd(16, "#"),
        eager: true,
      });
    });

    validator.onSuccess((e) => {
      const url = initRedirectURL();
      if (typeof url === "string") {
        window.location.replace(decodeURIComponent(url));
      }
      if (url instanceof URL) {
        const mapping = window.prefillMapping || {};
        e.currentTarget.querySelectorAll("input").forEach((input) => {
          let value = input.value.trim().replace(/^\+/, "");
          if (input.getAttribute("type") === "email") {
            value = value.toLowerCase();
          }
          const token = mapping[input.getAttribute("name")];
          if (token) {
            url.searchParams.set(token, value);
          }
        });
        window.location.replace(decodeURIComponent(url.toString()));
      }
    });
  });
};

init(() => {
  initSlider();
  initCountDown();
  initQuestions();
  initEligibility();
  initFaq();
  initBoxes();
  initWheel();
  initPrefill();
  initPopups();
  initTodayDates(".date-macro");
});
