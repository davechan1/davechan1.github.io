---
title: "Notes on Fast Inverse Square Root"
date: 2025-02-13T15:34:30-04:00
categories:
  - blog
tags:
  - Fast Inverse Square Root 
  - IEEE 754
---

It is just my note on understanding the mysterious Fast Inverse Square Root algorithm. I try to keep it as simple and clean as possible. By the way, for the amazing background stories behind it please check other great websites.

Anyways, let me copy and paste the code first:

```c
float Q_rsqrt(float number) {
  long i;
  float x2, y;
  const float threehalfs = 1.5F;

  x2 = number * 0.5F;
  y  = number;
  i  = *(long*)&y;                            // evil floating point bit level hacking
  i  = 0x5f3759df - ( i >> 1 );               // what the fuck?
  y  = *(float*)&i;
  y  = y * ( threehalfs - ( x2 * y * y ) );   // 1st iteration
  // y  = y * ( threehalfs - ( x2 * y * y ) );   // 2nd iteration, this can be removed

  return y;
}
```

Understanding it requires some background knowledge: Binary representation, IEEE 754, some Logarithms, type conversion in `C`, bit shifting, and Newton's method.

Before discussing the actual code I will discuss the IEEE 754 standard first.

****

## Binary Representation

An example should explain how it works:

$$
\begin{aligned}
1101.01_2 &= 1 \cdot 2^3 + 1 \cdot 2^2 + 0 \cdot 2^1 + 1 \cdot 2^0 + 0 \cdot 2^{-1} + 1 \cdot 2^{-2} \\
&= 8 + 4 + 0 + 1 + 0 + 0.25 \\
&= 13.25_{10}
\end{aligned}
$$

****

## Scientific Notation of Binary

Scientific Notation also works on binary numbers. Examples:

$$11000_2 \rightarrow 1100_2 \times 2^1 \rightarrow 110_2 \times 2^2 \rightarrow 11_2 \times 2^3 \rightarrow 1.1_2 \times 2^4$$

You can verify it by writing the number in binary representation and factoring out the "2"s.

Similarly, for decimals:

$$0.0101_2 \rightarrow 0.101_2 \times 2^{-1} \rightarrow 1.01_2 \times 2^{-2}$$

> **Note:** To convert $$1.1_2 \times 2^4$$ back to base 10, we can turn both $$1.1_2$$ and $$2^4$$ back to base 10:
> 
> $$1.1_2 \times 2^4 = (1+0.5)_{10} \times 16_{10} = 24_{10}$$

****

## IEEE 754 Structure (32-bit Normalized)

Check out the converter: [IEEE-754 Floating Point Converter](https://www.h-schmidt.net/FloatConverter/IEEE754.html)

We focus on the 32-bit version:

**Structure:** `[ S ] [ E E E E E E E E ] [ M M M ... M ]`

* **1 bit:** Sign ($$S$$) ($$0 = +ve, 1 = -ve$$)
* **8 bits:** Exponent ($$E$$) (Bias: 127)
* **23 bits:** Mantissa ($$M$$)

Formula:
$$
N = (-1)^{Sign} \times (1.Mantissa)_{2} \times 2^{Exponent-127}
$$

**Example 1 (convert a floating point number $$1.75_{10}$$):**

$$
1.75 = 1.11_2 = 1.11 \times 2^0
$$

Sign bit: $$\text{+ve} \implies S=0$$ 

Exponent: Actual Exponent = 0 $$\implies E - 127 = 0 \Rightarrow E = 127$$.

Mantissa: $$.11$$ implies bits `1100...0` for mantissa.

Resulting bits: `0 01111111 1100...00`

**Example 2 (convert a 32 bit binary):**

```text
1    10000001    1010 0000 0000 0000 0000 000
S    E           M
```

Sign bit is **1**   $$\implies \text{-ve}$$ 

The exponent bits are `10000001`

$$\implies$$ To decimal: $$10000001_2 = 129_{10}$$
$$\implies E = 129 - 127 = 2$$ 

The stored mantissa bits are `101...`.

Remember the *Hidden Bit*: The formula assumes a leading `1.` before these bits.

$$\text{Value} = 1.M$$

$$
1.101_{2} = 1 + 0.5 + 0.125 = 1.625
$$

Plug everything into the formula:

$$
N = (-1)^S \times (1.M) \times 2^{E-127}
$$

$$
N = (-1)^1 \times (1.625) \times 2^2
$$

$$
N = -1 \times 1.625 \times 4
$$

Resulting float: **-6.5**.

> **Note:** Denormalized / NaN / Inf are not considered here.

****

### Logarithm Approximation Derivation

Now set $$E$$ and $$M$$ as value for exponent and mantissa.

1. The integer representation $$I$$ of the floating point number is interpreted as:
   $$ I = 2^{23} \cdot E + M $$
   *(This is effectively shifting the exponent left by 23 bits and adding the mantissa)*

2. The actual floating point number $$x$$ is calculated by:
   $$ x = \left( 1 + \frac{M}{2^{23}} \right) \cdot 2^{E-127} $$

3. `(The essence part)` Take $$\log_2$$ of both sides:
   $$ \log_2(x) = \log_2\left(1 + \frac{M}{2^{23}}\right) + (E - 127) $$

4. `(The essence part)` **Approximation:** Using a linear approximation for the log curve $$\log_2(1+v) \approx v + \mu$$ (where $$\mu \approx 0.0430$$ is a correction constant):
   $$ \log_2(x) \approx \frac{M}{2^{23}} + \mu + E - 127 $$

5. Rearranging to relate back to the integer representation ($$I = M + 2^{23}E$$):
   $$ \log_2(x) \approx \frac{1}{2^{23}} (M + 2^{23}E) + \mu - 127 $$
   $$ \log_2(x) \approx \frac{1}{2^{23}} I + \mu - 127 $$

---

## The Code Setup

**Input:** `number (float)` 
**Variables (all 32 bits):**

* `long i` 
* `float x2, y`
* `const float threehalfs = 1.5F`

**Initialization:**

```c
x2 = number * 0.5F;
y = number;
```

## 1st Line: Bit Casting

```c
i = * (long *) &y;
```

* **Explanation:** Take the address of `y` (`&y`), cast that address to a pointer to a `long`, and dereference it.
* **Purpose:** Read the raw bits of the float as if they were an integer.

## 2nd Line: The Magic Constant

```c
i = 0x5f3759df - (i >> 1);
```

**Derivation:**
We want to calculate $$\Gamma = \frac{1}{\sqrt{y}} = y^{-1/2}$$.

In log space:
$$ \log_2(\Gamma) = \log_2(y^{-1/2}) = -\frac{1}{2}\log_2(y) $$

Using the log approximation:
$$ \log_2(\Gamma) \approx \frac{1}{2^{23}} I_\Gamma + \mu - 127 $$
$$ \log_2(y) \approx \frac{1}{2^{23}} I_y + \mu - 127 $$

Substitute these into the log equation:
$$ \frac{1}{2^{23}} I_\Gamma + \mu - 127 = -\frac{1}{2} \left[ \frac{1}{2^{23}} I_y + \mu - 127 \right] $$

**Solve for $$I_\Gamma$$ (the integer representation of the result):**
$$ \frac{1}{2^{23}} I_\Gamma = -\frac{3}{2}(\mu - 127) - \frac{1}{2} \left[ \frac{1}{2^{23}} I_y \right] $$

Multiply by $$2^{23}$$:
$$ I_\Gamma = \frac{3}{2} 2^{23} (127 - \mu) - \frac{1}{2} I_y $$

1. The term $$\frac{3}{2} 2^{23} (127 - \mu)$$ is a constant. With $$\mu \approx 0.043$$, this calculates to **`0x5f3759df`**.
2. The term $$-\frac{1}{2} I_y$$ corresponds to the rightshift bitwise operation for dividing by 2 `-(i >> 1)`.

**Casting back:**

```c
y = * (float *) &i;
```

Float cast back to convert the integer bits back to a floating point number.

> Note: The missing bit from right shift and other approximation cause error, and refined by Newton's Method

---

## Newton's Method

We have an initial guess $$y_{approx}$$ from previous line. We want to refine it.
Target: $$y = \frac{1}{\sqrt{x}} \Rightarrow y^2 = \frac{1}{x} \Rightarrow \frac{1}{y^2} - x = 0$$.

With $$x$$ being the original input, we define the root-finding function:
$$ f(y) = \frac{1}{y^2} - x $$

Then, now the job is to find $$y$$ such that $$f(y) = 0$$.

**Derivative:**
$$ f'(y) = -2y^{-3} = \frac{-2}{y^3} $$

**Newton-Raphson Formula:**
$$ y_{n+1} = y_n - \frac{f(y_n)}{f'(y_n)} $$

Substitute $$f(y)$$ and $$f'(y)$$:
$$ y_{n+1} = y_n - \frac{(\frac{1}{y_n^2} - x)}{(\frac{-2}{y_n^3})} $$
$$ y_{n+1} = y_n - \left( \frac{1}{y_n^2} - x \right) \cdot \left( \frac{y_n^3}{-2} \right) $$

$$ y_{n+1} = y_n + \frac{1}{2} y_n - \frac{x}{2} y_n^3 $$
$$ y_{n+1} = y_n \left( \frac{3}{2} - \frac{x}{2} y_n^2 \right) $$

**In Code:**

```c
y = y * (1.5F - (x2 * y * y));
```

*(Recall `x2` was set to `0.5 * number` earlier)*

##### Reference:

[Fast Inverse Square Root — A Quake III Algorithm - YouTube](https://www.youtube.com/watch?v=p8u_k2LIZyo)
