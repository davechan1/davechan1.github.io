---
title: "Notes on Differential Flatness of quadcopter system"
date: 2025-02-13T15:34:30-04:00
categories:
  - blog
tags:
  - Differential Flatness
  - Quadcopter
---


Here are my notes on the differential flatness of a quadcopter, translating the handwritten derivations into a clean format.

## Quadcopter State

The state of a quadcopter can be defined as:

$$
X = [x, y, z, \phi, \theta, \psi, \dot{x}, \dot{y}, \dot{z}, \omega_x, \omega_y, \omega_z]^T
$$

**Note:** All variables are expressed in the inertial frame $$\{I\}$$, except for the angular velocity $$\omega$$ which is in the body frame $$\{B\}$$. 
We use a $$\psi \rightarrow \theta \rightarrow \phi$$ (yaw-pitch-roll) sequence, which gives us the frame transformations: $$\{I\} \rightarrow \{\psi\} \rightarrow \{\theta\} \rightarrow \{\phi\} = \{B\}$$.

---

## Dynamics

### Newton's Equation of Motion

$$
ma = \begin{bmatrix} 0 \\ 0 \\ -mg \end{bmatrix} + {}^I R_B \begin{bmatrix} 0 \\ 0 \\ \sum F_i \end{bmatrix}
$$

### Euler's Equation of Motion for Rotation

$$
I\dot{\omega} + \omega \times (I\omega) = \tau
$$

Where:
*   $$\omega = {}^B\begin{bmatrix} \omega_x \\ \omega_y \\ \omega_z \end{bmatrix}$$
*   $$I$$ is the inertia matrix in $$\{B\}$$.
*   *(Remark: All terms are in $$\{B\}$$. The $$\omega \times (I\omega)$$ term accounts for the fact that $$\{B\}$$ is indeed rotating.)*

The torque $$\tau$$ is defined by the motor forces ($$F_i$$) and moments ($$M_i$$):

$$
\tau = \begin{bmatrix} l(F_2 - F_4) \\ l(F_3 - F_1) \\ M_1 - M_2 + M_3 - M_4 \end{bmatrix}
$$

### Input Transformation

Instead of using the individual motor forces $$F_i$$ as inputs, we use these 4 virtual inputs $$u$$:

$$
u = \begin{bmatrix} u_1 \\ u_2 \\ u_3 \\ u_4 \end{bmatrix} = \begin{bmatrix} T \\ \tau_\phi \\ \tau_\theta \\ \tau_\psi \end{bmatrix}
$$

Where total thrust $$T = \sum F_i$$, and the torques are:

$$
\begin{bmatrix} \tau_\phi \\ \tau_\theta \\ \tau_\psi \end{bmatrix} = \begin{bmatrix} l(F_2 - F_4) \\ l(F_3 - F_1) \\ M_1 - M_2 + M_3 - M_4 \end{bmatrix}
$$

---

## Differential Flatness

**Definition:** For a state $$X \in \mathbb{R}^n$$ and input $$u \in \mathbb{R}^m$$, we can find a set of flat outputs $$y \in \mathbb{R}^m$$ such that $$X$$ and $$u$$ can be retrieved by $$y$$ and its derivatives ($$\dot{y}, \ddot{y}, \dots$$) only.

$$
\Rightarrow y = y(x, u, \dot{u}, \dots)
$$
such that:
$$
x = x(y, \dot{y}, \dots)
$$
$$
u = u(y, \dot{y}, \dots)
$$

For a quadcopter, the flat outputs are chosen as:
$$
y = (x, y, z, \psi)
$$

---

## Proof for Quadcopter

### 1. Orientation

Rewrite the Newton equation a bit:

$$
ma = \begin{bmatrix} 0 \\ 0 \\ -mg \end{bmatrix} + u_1 z_B
$$

Solving for the body z-axis vector $$z_B$$:

$$
z_B = \frac{m}{u_1} \begin{bmatrix} \ddot{x} \\ \ddot{y} \\ \ddot{z} + g \end{bmatrix}
$$

For the yaw-pitch-roll sequence, we can get frame $$\{\psi\}$$ first as $$\psi$$ is chosen as a flat output. Here we illustrate the sequence for reference.

<img src="/assets/2025-02-13-Differential-Flatness-of-Quadcopters-Notes/Yaw_pitch_Roll_illustration.png">


Checking the geometry, we know for $$\{B\}$$ (the `after roll` frame) that $$x_B (R_x) \perp y_\psi (Y_y)$$. Also, since $$x_B \perp z_B$$ and $$z_B$$ is known:

$$
x_B = \frac{y_\psi \times z_B}{\| y_\psi \times z_B \|}
$$

And consequently:

$$
y_B = z_B \times x_B
$$

Then the full orientation ($$x_B, y_B, z_B$$) is known.

### 2. Angular Velocity

Differentiate the acceleration equation in the inertial frame $$\{I\}$$:

$$
m\dot{a} = \dot{u}_1 z_B + {}^I\omega_B \times u_1 z_B
$$

*(Note: $${}^I\omega_B$$ is the angular velocity, but expressed in $$\{I\}$$)*

Since the quadcopter only has vertical thrust in $$\{B\}$$:

$$
\dot{u}_1 = m\dot{a} \cdot z_B
$$

Therefore:

$$
m\dot{a} = (m\dot{a} \cdot z_B)z_B + u_1({}^I\omega_B \times z_B)
$$

Rearranging to isolate the cross product:

$$
{}^I\omega_B \times z_B = \frac{m}{u_1} (\dot{a} - (z_B \cdot \dot{a})z_B)
$$

Also, we can express $${}^I\omega_B$$ using the body frame axes expressed in $$\{I\}$$:

$$
{}^I\omega_B = \omega_x x_B + \omega_y y_B + \omega_z z_B
$$

*(Recap: $$x_B, y_B, z_B$$ are $$\{B\}$$ axes expressed in $$\{I\}$$)*

Substitute this into the cross product:

$$
{}^I\omega_B \times z_B = \omega_x(-y_B) + \omega_y x_B
$$

By taking the dot product with the respective axes, we can solve for $$\omega_x$$ and $$\omega_y$$:

$$
\therefore \omega_x = -({}^I\omega_B \times z_B) \cdot y_B
$$

$$
\therefore \omega_y = ({}^I\omega_B \times z_B) \cdot x_B
$$

For $$\omega_z$$, we know:

$$
{}^I\omega_B = {}^I\omega_\psi + {}^\psi\omega_B
$$

And $${}^\psi\omega_B$$ contains no $$z_B$$ part (as it happens after yaw already).

Taking the dot product with $$z_B$$:

$$
\omega_z = {}^I\omega_B \cdot z_B = {}^I\omega_\psi \cdot z_B = \dot{\psi} z_I \cdot z_B
$$